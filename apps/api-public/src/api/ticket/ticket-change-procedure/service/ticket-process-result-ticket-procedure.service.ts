import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../../../_libs/common/dto/file'
import { ESArray } from '../../../../../../_libs/common/helpers'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  DeliveryStatus,
  DiscountType,
  MovementType,
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import {
  Batch,
  Customer,
  Image,
  Product,
  TicketBatch,
  TicketProduct,
  TicketRegimen,
  TicketRegimenItem,
  TicketUser,
} from '../../../../../../_libs/database/entities'
import { ImageInteractType } from '../../../../../../_libs/database/entities/image.entity'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../../../_libs/database/entities/payment.entity'
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
  CustomerRepository,
  PaymentRepository,
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
    private socketEmitService: SocketEmitService,
    private cacheDataService: CacheDataService,
    private imageManagerService: ImageManagerService,
    private ticketRepository: TicketRepository,
    private customerRepository: CustomerRepository,
    private paymentRepository: PaymentRepository,
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
    const ticketProcedureId = ticketProcedureResult.ticketProcedureId
    const createdAt = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)

    const transaction = await this.ticketRepository.startTransaction()
    const manager = transaction.manager
    try {
      // === 1. Init
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
      let ticketRegimenOrigin: TicketRegimen
      if (ticketProcedureOrigin.ticketProcedureType === TicketProcedureType.InRegimen) {
        ticketRegimenOrigin = await this.ticketRegimenRepository.managerFindOneBy(manager, {
          oid,
          ticketId,
          id: ticketProcedureOrigin.ticketRegimenId,
        })
      }

      let customerModified: Customer
      let ticketModified = ticketOrigin
      let imageIds = ticketProcedureOrigin.imageIds
      let ticketUserResultDestroyedList: TicketUser[] = []
      let ticketUserResultCreatedList: TicketUser[] = []
      let imageDestroyedList: Image[] = []
      let imageCreatedList: Image[] = []
      let productModifiedList: Product[] = []
      let batchModifiedList: Batch[] = []
      let ticketProductConsumableDestroyList: TicketProduct[] = []
      let ticketProductConsumableCreatedList: TicketProduct[] = []
      let ticketBatchConsumableCreatedList: TicketBatch[] = []
      let ticketBatchConsumableDestroyedList: TicketBatch[] = []
      let ticketRegimenModified: TicketRegimen
      let ticketRegimenItemModified: TicketRegimenItem

      // === 2. Cập nhật TicketUser
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
            createdAt,
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

      // === 3. Cập nhật Image
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

      // === 4. Cập nhật vật tư tiêu hao
      if (body.ticketProductConsumableList) {
        if (ticketProcedureOrigin.status === TicketProcedureStatus.Completed) {
          ticketProductConsumableDestroyList = await this.ticketProductRepository.managerDelete(
            manager,
            {
              oid,
              ticketId,
              type: TicketProductType.Procedure,
              ticketProcedureId,
            }
          )
        }

        if (ticketProductConsumableDestroyList.length) {
          ticketBatchConsumableDestroyedList = await this.ticketBatchRepository.managerDelete(
            manager,
            {
              oid,
              ticketId,
              ticketProductId: { IN: ticketProductConsumableDestroyList.map((i) => i.id) },
            }
          )

          const putawayContainer = await this.productPutawayManager.startPutaway({
            manager,
            oid,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            movementType: MovementType.Ticket,
            isRefund: 1,
            time: createdAt,
            voucherBatchPutawayList: ticketBatchConsumableDestroyedList.map((i) => {
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

        if (body.ticketProductConsumableList.length) {
          const pickingContainer = await this.productPickupManager.startPickup({
            manager,
            oid,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            movementType: MovementType.Ticket,
            isRefund: 0,
            time: createdAt,
            allowNegativeQuantity,
            voucherProductPickupList: body.ticketProductConsumableList.map((i) => {
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

              paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
              pickupStrategy: i.pickupStrategy,
              warehouseIds: JSON.stringify([]),
              productId: i.productId,
              batchId: 0,
              type: TicketProductType.Procedure,
              ticketProcedureId,

              priority: 0,
              createdAt,
              unitRate: 1,
              quantityPrescription: 0,
              printPrescription: 0,
              hintUsage: '',
              paid: 0,
              debt: 0,
            }
            return insert
          })
          ticketProductConsumableCreatedList = await this.ticketProductRepository.managerInsertMany(
            manager,
            ticketProductInsertList
          )
          const ticketProductCreatedMap = ESArray.arrayToKeyValue(
            ticketProductConsumableCreatedList,
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
          ticketBatchConsumableCreatedList = await this.ticketBatchRepository.managerInsertMany(
            manager,
            ticketBatchInsertList
          )
        }
      }

      // === 5. Calculator
      let paymentMoneyStatus = ticketProcedureOrigin.paymentMoneyStatus
      let ticketProcedureStatus = ticketProcedureOrigin.status
      let paidItemAdd = 0
      let debtItemAdd = 0
      let ticketProcedurePaidUpdate = ticketProcedureOrigin.paid
      let ticketProcedureDebtUpdate = ticketProcedureOrigin.debt
      let procedureMoneyAdd = 0
      let itemsDiscountAdd = 0

      // === 5.1. Tính itemCostAmount
      const itemsCostAmountAdd =
        ticketProductConsumableCreatedList.reduce((acc, item) => {
          return acc + item.costAmount
        }, 0)
        - ticketProductConsumableDestroyList.reduce((acc, item) => {
          return acc + item.costAmount
        }, 0)

      // === 5.2. Tính commissionMoney
      const commissionMoneyAdd =
        ticketUserResultCreatedList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)
        - ticketUserResultDestroyedList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)

      // === 5.3. TH Hoàn thành: Tính toán TicketProcedureStatus và PaymentMoneyStatus ===
      if (ticketProcedureResult.completedAt) {
        ticketProcedureStatus = TicketProcedureStatus.Completed
        const moneyAmountTemp = ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
        // A.1. Với trường hợp NoEffect
        if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.NoEffect) {
          if (ticketOrigin.isPaymentEachItem) {
            if (ticketOrigin.paid >= moneyAmountTemp) {
              // lấy tiền từ ticketPaid
              paymentMoneyStatus = PaymentMoneyStatus.FullPaid
              paidItemAdd = moneyAmountTemp
              ticketProcedurePaidUpdate = moneyAmountTemp
            } else {
              // không đủ tiền thì ở trạng thái Pending
              paymentMoneyStatus = PaymentMoneyStatus.PendingPayment
            }
          } else {
            // tính tình theo Ticket thì chuyển sang trạng thái đã thanh toán theo ticket (cập nhật tiền tí nữa sẽ tính ở dưới)
            paymentMoneyStatus = PaymentMoneyStatus.TicketPaid
          }
        }
        // A.2. Với trường hợp PendingPayment
        if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.PendingPayment) {
          if (ticketOrigin.paid >= moneyAmountTemp) {
            // lấy tiền từ ticketPaid
            paymentMoneyStatus = PaymentMoneyStatus.FullPaid
            paidItemAdd = moneyAmountTemp
            ticketProcedurePaidUpdate = moneyAmountTemp
          } else {
            paymentMoneyStatus = PaymentMoneyStatus.PendingPayment
          }
        }
      }

      // === 5.4. TH Hủy: Tính toán TicketProcedureStatus và PaymentMoneyStatus ===
      if (ticketProcedureOrigin.completedAt && !ticketProcedureResult.completedAt) {
        // Tính lại ticketPaid và ticketDebt
        if (ticketProcedureOrigin.paid || ticketProcedureOrigin.debt) {
          paidItemAdd = -ticketProcedureOrigin.paid
          debtItemAdd = -ticketProcedureOrigin.debt
          ticketProcedurePaidUpdate = 0
          ticketProcedureDebtUpdate = 0
        }
        if (ticketProcedureOrigin.ticketProcedureType === TicketProcedureType.Normal) {
          ticketProcedureStatus = TicketProcedureStatus.Pending
          if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.TicketPaid) {
            paymentMoneyStatus = PaymentMoneyStatus.TicketPaid
          } else {
            paymentMoneyStatus = PaymentMoneyStatus.PendingPayment
          }
        }
        if (ticketProcedureOrigin.ticketProcedureType === TicketProcedureType.InRegimen) {
          // Nếu hủy thì paymentMoneyStatus và status về Pending hoặc NoEffect
          if (ticketRegimenOrigin.isEffectTotalMoney) {
            ticketProcedureStatus = TicketProcedureStatus.Pending
            if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.TicketPaid) {
              paymentMoneyStatus = PaymentMoneyStatus.TicketPaid
            } else {
              paymentMoneyStatus = PaymentMoneyStatus.PendingPayment
            }
          } else {
            paymentMoneyStatus = PaymentMoneyStatus.NoEffect
            ticketProcedureStatus = TicketProcedureStatus.NoEffect
          }
        }
      }

      // === 6. Cập nhật ticketProcedure
      const ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
        manager,
        { oid, id: ticketProcedureId },
        {
          costAmount: () => `"costAmount" + ${itemsCostAmountAdd}`,
          commissionAmount: () => `"commissionAmount" + ${commissionMoneyAdd}`,
          imageIds,
          result: ticketProcedureResult.result,
          completedAt: ticketProcedureResult.completedAt,
          status: ticketProcedureStatus,
          paymentMoneyStatus,
          paid: ticketProcedurePaidUpdate,
          debt: ticketProcedureDebtUpdate,
        }
      )

      if (ticketProcedureModified.completedAt) {
        if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.NoEffect) {
          procedureMoneyAdd = ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
          itemsDiscountAdd = ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
        }
      }
      if (ticketProcedureOrigin.completedAt && !ticketProcedureModified.completedAt) {
        if (ticketProcedureModified.paymentMoneyStatus === PaymentMoneyStatus.NoEffect) {
          procedureMoneyAdd = -ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
          itemsDiscountAdd = -ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
        }
      }

      // === 7. Cập nhật TICKET, CUSTOMER DEBT và PAYMENT ===
      if (
        itemsCostAmountAdd !== 0
        || commissionMoneyAdd !== 0
        || itemsDiscountAdd !== 0
        || procedureMoneyAdd !== 0
        || paidItemAdd !== 0
        || debtItemAdd !== 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd,
            itemsCostAmountAdd,
            procedureMoneyAdd,
            itemsDiscountAdd,
          },
          other: {
            paidAdd: -paidItemAdd,
            paidItemAdd,
            debtItemAdd,
          },
        })
      }
      if (debtItemAdd) {
        const timePayment = Date.now()
        customerModified = await this.customerRepository.managerUpdateOne(
          manager,
          { oid, id: customerId },
          { updatedAt: timePayment, debt: () => `debt + ${debtItemAdd}` }
        )
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: customerId,

          cashierId: 0,
          walletId: '0',
          createdAt: timePayment,
          paymentActionType: PaymentActionType.Other,
          moneyDirection: MoneyDirection.Other,
          note: '',

          paid: 0,
          paidItem: 0,
          debt: 0,
          debtItem: debtItemAdd,
          personOpenDebt: customerModified.debt - debtItemAdd,
          personCloseDebt: customerModified.debt,
          walletOpenMoney: 0,
          walletCloseMoney: 0,
        }

        const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)
      }

      // Tính toán cho TicketProcedure Regimen
      if (ticketProcedureModified.ticketProcedureType === TicketProcedureType.InRegimen) {
        let quantityUsedAdd = 0
        let moneyAmountUsedAdd = 0
        let quantityActualAdd = 0
        let moneyAmountActualAdd = 0

        // Trường hợp hoàn thành
        if (ticketProcedureModified.completedAt) {
          if (!ticketProcedureOrigin.completedAt) {
            quantityUsedAdd = ticketProcedureModified.quantity
            moneyAmountUsedAdd =
              ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
          }
          if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.NoEffect) {
            quantityActualAdd = ticketProcedureModified.quantity
            moneyAmountActualAdd =
              ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
          }
          if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.PendingPayment) {
          }
        }

        // Trường hợp hủy
        if (ticketProcedureOrigin.completedAt && !ticketProcedureModified.completedAt) {
          quantityUsedAdd = -ticketProcedureModified.quantity
          moneyAmountUsedAdd =
            -ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
          if (ticketProcedureModified.paymentMoneyStatus === PaymentMoneyStatus.NoEffect) {
            quantityActualAdd = -ticketProcedureModified.quantity
            moneyAmountActualAdd =
              -ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
          }
        }

        // === 1. Xử lý cho TicketRegimenItem ===
        if (
          quantityUsedAdd != 0
          || moneyAmountUsedAdd != 0
          || quantityActualAdd != 0
          || moneyAmountActualAdd != 0
        ) {
          ticketRegimenItemModified = await this.ticketRegimenItemRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProcedureModified.ticketRegimenItemId },
            {
              quantityUsed: () => `"quantityUsed" + ${quantityUsedAdd}`,
              moneyAmountUsed: () => `"moneyAmountUsed" + ${moneyAmountUsedAdd}`,
              quantityActual: () => `"quantityActual" + ${quantityActualAdd}`,
              moneyAmountActual: () => `"moneyAmountActual" + ${moneyAmountActualAdd}`,
            }
          )
        }

        // === 2. Xử lý cho TicketRegimen ===
        let ticketRegimenStatus = TicketRegimenStatus.Executing
        const ticketRegimenItemList = await this.ticketRegimenItemRepository.managerFindManyBy(
          manager,
          { oid, ticketId, ticketRegimenId: ticketProcedureOrigin.ticketRegimenId }
        )
        if (ticketRegimenItemList.every((i) => i.quantityUsed === i.quantityRegular)) {
          ticketRegimenStatus = TicketRegimenStatus.Completed
        }
        if (ticketRegimenItemList.every((i) => i.quantityUsed === 0)) {
          ticketRegimenStatus = TicketRegimenStatus.Pending
        }
        if (
          ticketRegimenStatus !== ticketRegimenOrigin.status
          || itemsCostAmountAdd !== 0
          || commissionMoneyAdd !== 0
          || moneyAmountActualAdd !== 0
          || moneyAmountUsedAdd !== 0
          || paidItemAdd !== 0
          || debtItemAdd !== 0
        ) {
          ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProcedureModified.ticketRegimenId },
            {
              status: ticketRegimenStatus,
              costAmount: () => `"costAmount" + ${itemsCostAmountAdd}`,
              commissionAmount: () => `"commissionAmount" + ${commissionMoneyAdd}`,
              moneyAmountActual: () => `"moneyAmountActual" + ${moneyAmountActualAdd}`,
              moneyAmountUsed: () => `"moneyAmountUsed" + ${moneyAmountUsedAdd}`,
              paidItem: () => `paidItem + ${paidItemAdd}`,
              debtItem: () => `debtItem + ${debtItemAdd}`,
            }
          )
        }
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
          upsertedList: ticketProductConsumableCreatedList,
          destroyedList: ticketProductConsumableDestroyList,
        },
        ticketBatch: {
          upsertedList: ticketBatchConsumableCreatedList,
          destroyedList: ticketBatchConsumableDestroyedList,
        },
      })
      if (customerModified) {
        this.socketEmitService.customerUpsert(oid, { customer: customerModified })
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
