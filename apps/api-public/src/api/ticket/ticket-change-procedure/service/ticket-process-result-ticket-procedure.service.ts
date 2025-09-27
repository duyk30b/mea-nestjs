import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../../../_libs/common/dto/file'
import { ESArray } from '../../../../../../_libs/common/helpers'
import { BusinessError } from '../../../../../../_libs/database/common/error'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  DeliveryStatus,
  DiscountType,
  MovementType,
  PaymentEffect,
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import {
  Batch,
  Image,
  Product,
  TicketBatch,
  TicketProduct,
  TicketRegimen,
  TicketRegimenItem,
  TicketUser,
} from '../../../../../../_libs/database/entities'
import { ImageInteractType } from '../../../../../../_libs/database/entities/image.entity'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import { TicketBatchInsertType } from '../../../../../../_libs/database/entities/ticket-batch.entity'
import {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import {
  TicketProductInsertType,
  TicketProductType,
} from '../../../../../../_libs/database/entities/ticket-product.entity'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import {
  ProductPickupManager,
  ProductPutawayManager,
  TicketChangeItemMoneyManager,
  TicketUserCommon,
} from '../../../../../../_libs/database/operations'
import {
  TicketBatchRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketProcessResultTicketProcedureBody } from '../request'

@Injectable()
export class TicketProcessResultTicketProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPickupManager: ProductPickupManager,
    private productPutawayManager: ProductPutawayManager
  ) { }

  async processResultTicketProcedure(props: {
    oid: number
    ticketId: string
    body: TicketProcessResultTicketProcedureBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = props
    const { ticketProcedureResult } = body
    const time = ticketProcedureResult.completedAt
    const ticketProcedureId = ticketProcedureResult.ticketProcedureId

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)

    const transaction = await this.ticketRepository.startTransaction()
    const manager = transaction.manager
    try {
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        { updatedAt: Date.now() }
      )

      const customerId = ticketOrigin.customerId

      const ticketProcedureOrigin = await this.ticketProcedureRepository.managerFindOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      let ticketModified = ticketOrigin
      let imageIds = ticketProcedureOrigin.imageIds
      let ticketUserResultDestroyedList: TicketUser[] = []
      let ticketUserResultCreatedList: TicketUser[] = []
      let imageDestroyedList: Image[] = []
      let imageCreatedList: Image[] = []
      let productModifiedList: Product[] = []
      let batchModifiedList: Batch[] = []
      let ticketProductProcedureDestroyList: TicketProduct[] = []
      let ticketProductProcedureCreatedList: TicketProduct[] = []
      let ticketBatchProcedureCreatedList: TicketBatch[] = []
      let ticketBatchProcedureDestroyedList: TicketBatch[] = []
      let ticketRegimenModified: TicketRegimen
      let ticketRegimenItemModified: TicketRegimenItem

      if (body.ticketUserResultList) {
        if (ticketProcedureOrigin.status === TicketProcedureStatus.Completed) {
          ticketUserResultDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
            oid,
            ticketId,
            positionType: { IN: [PositionType.ProcedureResult] },
            ticketItemId: ticketProcedureId,
          })
        }

        if (body.ticketUserResultList.length) {
          ticketUserResultCreatedList = await this.ticketUserCommon.addTicketUserList({
            manager,
            oid,
            ticketId,
            createdAt: time,
            ticketUserDtoList: body.ticketUserResultList
              .map((i, index) => {
                return {
                  userId: i.userId,
                  positionId: i.positionId,
                  quantity: ticketProcedureOrigin.quantity,
                  ticketItemId: ticketProcedureOrigin.id,
                  positionInteractId: ticketProcedureOrigin.procedureId,
                  ticketItemExpectedPrice: ticketProcedureOrigin.expectedPrice,
                  ticketItemActualPrice: ticketProcedureOrigin.actualPrice,
                }
              })
              .filter((i) => !!i.userId),
          })
        }
      }

      if (body.imagesChange) {
        const imageChangeResponse = await this.imageManagerService.changeCloudinaryImageLink({
          oid,
          files,
          imageIdWaitList: body.imagesChange.imageIdWaitList,
          externalUrlList: body.imagesChange.externalUrlList,
          imageIdListOld: JSON.parse(ticketProcedureOrigin.imageIds),
          imageInteract: {
            imageInteractType: ImageInteractType.Customer,
            imageInteractId: customerId,
            ticketId,
            ticketItemId: ticketProcedureId,
          },
        })
        imageIds = JSON.stringify(imageChangeResponse.imageIdListNew)

        imageDestroyedList = imageChangeResponse.imageDestroyedList
        imageCreatedList = imageChangeResponse.imageCreatedList
      }

      if (body.ticketProductProcedureResultList) {
        if (ticketProcedureOrigin.status === TicketProcedureStatus.Completed) {
          ticketProductProcedureDestroyList = await this.ticketProductRepository.managerDelete(
            manager,
            {
              oid,
              ticketId,
              type: TicketProductType.Procedure,
              ticketProcedureId,
            }
          )
        }

        if (ticketProductProcedureDestroyList.length) {
          ticketBatchProcedureDestroyedList = await this.ticketBatchRepository.managerDelete(
            manager,
            {
              oid,
              ticketId,
              ticketProductId: { IN: ticketProductProcedureDestroyList.map((i) => i.id) },
            }
          )

          const putawayContainer = await this.productPutawayManager.startPutaway({
            manager,
            oid,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            movementType: MovementType.Ticket,
            isRefund: 1,
            time,
            voucherBatchPutawayList: ticketBatchProcedureDestroyedList.map((i) => {
              return {
                voucherProductId: i.ticketProductId,
                voucherBatchId: i.id,
                warehouseId: i.warehouseId,
                productId: i.productId,
                batchId: i.batchId,
                quantity: i.quantity,
                costAmount: i.costAmount,
                expectedPrice: i.expectedPrice,
                actualPrice: i.actualPrice,
              }
            }),
          })
          const { putawayPlan } = putawayContainer
        }

        if (body.ticketProductProcedureResultList.length) {
          const pickingContainer = await this.productPickupManager.startPickup({
            manager,
            oid,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            movementType: MovementType.Ticket,
            isRefund: 0,
            time,
            allowNegativeQuantity,
            voucherProductPickupList: body.ticketProductProcedureResultList.map((i) => {
              return {
                voucherProductId: GenerateId.nextId(),
                productId: i.productId,
                batchId: 0,
                warehouseIds: i.warehouseIds,
                quantity: i.quantity,
                pickupStrategy: i.pickupStrategy,
                expectedPrice: 0,
                actualPrice: 0,
                costAmount: null,
              }
            }),
          })
          const { pickupPlan } = pickingContainer
          productModifiedList = pickingContainer.productModifiedList
          batchModifiedList = pickingContainer.batchModifiedList
          const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')
          const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

          const ticketProductInsertList = pickupPlan.pickupVoucherProductList.map((i) => {
            const insert: TicketProductInsertType = {
              id: i.voucherProductId,
              oid,
              customerId,
              ticketId,

              expectedPrice: 0,
              discountType: DiscountType.Percent,
              discountPercent: 0,
              discountMoney: 0,
              actualPrice: 0,

              costAmount: i.pickupCostAmount,
              quantity: i.pickupQuantity,
              deliveryStatus: DeliveryStatus.Delivered,

              paymentMoneyStatus: PaymentMoneyStatus.PendingPaid,
              pickupStrategy: i.pickupStrategy,
              warehouseIds: JSON.stringify([]),
              productId: i.productId,
              batchId: 0,
              type: TicketProductType.Procedure,
              ticketProcedureId,

              priority: 0,
              createdAt: time,
              unitRate: 1,
              quantityPrescription: 0,
              printPrescription: 0,
              hintUsage: '',
              paymentEffect: PaymentEffect.RelationPayment,
            }
            return insert
          })
          ticketProductProcedureCreatedList = await this.ticketProductRepository.managerInsertMany(
            manager,
            ticketProductInsertList
          )
          const ticketProductCreatedMap = ESArray.arrayToKeyValue(
            ticketProductProcedureCreatedList,
            'id'
          )

          const ticketBatchInsertList = pickupPlan.pickupVoucherBatchList.map((i) => {
            const ticketProductCreated = ticketProductCreatedMap[i.voucherProductId]
            const batchOrigin = batchModifiedMap[i.batchId]
            const ticketBatchInsert: TicketBatchInsertType = {
              id: GenerateId.nextId(),
              oid,
              ticketId,
              customerId,
              ticketProductId: i.voucherProductId,
              warehouseId: batchOrigin?.warehouseId || 0,
              productId: i.productId,
              batchId: i.batchId || 0, // thằng pickupStrategy.NoImpact luôn lấy batchId = 0
              deliveryStatus: DeliveryStatus.Delivered,
              unitRate: 1,
              quantity: i.pickupQuantity,
              costAmount: i.pickupCostAmount,
              actualPrice: ticketProductCreated.actualPrice,
              expectedPrice: ticketProductCreated.expectedPrice,
            }
            return ticketBatchInsert
          })
          ticketBatchProcedureCreatedList = await this.ticketBatchRepository.managerInsertMany(
            manager,
            ticketBatchInsertList
          )
        }
      }

      const commissionMoneyAdd =
        ticketUserResultCreatedList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)
        - ticketUserResultDestroyedList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)

      const itemCostAmountAdd =
        ticketProductProcedureCreatedList.reduce((acc, item) => {
          return acc + item.costAmount
        }, 0)
        - ticketProductProcedureDestroyList.reduce((acc, item) => {
          return acc + item.costAmount
        }, 0)

      const ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
        manager,
        { oid, id: ticketProcedureId },
        {
          costAmount: () => `costAmount + ${itemCostAmountAdd}`,
          commissionAmount: () => `commissionAmount + ${commissionMoneyAdd}`,
          imageIds,
          result: ticketProcedureResult.result,
          completedAt: ticketProcedureResult.completedAt,
          status: ticketProcedureResult.completedAt
            ? TicketProcedureStatus.Completed
            : TicketProcedureStatus.Pending,
        }
      )

      if (itemCostAmountAdd !== 0 || commissionMoneyAdd !== 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd,
            itemsCostAmountAdd: itemCostAmountAdd,
          },
        })
      }

      if (ticketProcedureModified.ticketProcedureType === TicketProcedureType.InRegimen) {
        if (
          ticketProcedureOrigin.status === TicketProcedureStatus.Pending
          && ticketProcedureModified.status === TicketProcedureStatus.Completed
        ) {
          ticketRegimenItemModified = await this.ticketRegimenItemRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProcedureModified.ticketRegimenItemId },
            { quantityFinish: () => `quantityFinish + ${ticketProcedureModified.quantity}` }
          )
        }
        if (
          ticketProcedureOrigin.status === TicketProcedureStatus.Completed
          && ticketProcedureModified.status === TicketProcedureStatus.Pending
        ) {
          ticketRegimenItemModified = await this.ticketRegimenItemRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProcedureModified.ticketRegimenItemId },
            { quantityFinish: () => `quantityFinish - ${ticketProcedureModified.quantity}` }
          )
        }

        if (ticketRegimenItemModified) {
          if (ticketRegimenItemModified.quantityFinish > ticketRegimenItemModified.quantityTotal) {
            throw new BusinessError('Số lượng thực hiện không hợp lệ')
          }
        }

        const { ticketRegimenId } = ticketRegimenItemModified

        let ticketRegimenStatus = TicketRegimenStatus.Executing
        const ticketRegimenItemList = await this.ticketRegimenItemRepository.managerFindManyBy(
          manager,
          { oid, ticketId, ticketRegimenId }
        )
        if (
          ticketRegimenItemList.every((i) => {
            return i.quantityFinish === i.quantityTotal
          })
        ) {
          ticketRegimenStatus = TicketRegimenStatus.Completed
        }
        if (
          ticketRegimenItemList.every((i) => {
            return i.quantityFinish === 0
          })
        ) {
          ticketRegimenStatus = TicketRegimenStatus.Pending
        }

        ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
          manager,
          { oid, id: ticketProcedureModified.ticketRegimenId },
          {
            status: ticketRegimenStatus,
            costAmount: () => `costAmount + ${itemCostAmountAdd}`,
            commissionAmount: () => `commissionAmount + ${commissionMoneyAdd}`,
          }
        )
      }

      await transaction.commit()

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        imageList: {
          destroyedList: imageDestroyedList,
          upsertedList: imageCreatedList,
        },
        ticketUser: {
          upsertedList: ticketUserResultCreatedList,
          destroyedList: ticketUserResultDestroyedList,
        },
        ticketProcedure: { upsertedList: [ticketProcedureModified] },
        ticketRegimen: {
          upsertedList: ticketRegimenModified ? [ticketRegimenModified] : [],
        },
        ticketRegimenItem: {
          upsertedList: ticketRegimenItemModified ? [ticketRegimenItemModified] : [],
        },
        ticketProduct: {
          upsertedList: ticketProductProcedureCreatedList,
          destroyedList: ticketProductProcedureDestroyList,
        },
        ticketBatch: {
          upsertedList: ticketBatchProcedureCreatedList,
          destroyedList: ticketBatchProcedureDestroyedList,
        },
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
