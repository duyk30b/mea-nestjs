import { Injectable } from '@nestjs/common'
import {
  MovementType,
} from '../../../../../../_libs/database/common/variable'
import {
  Batch,
  Image,
  Product,
  TicketBatch,
  TicketProduct,
  TicketUser,
} from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import { TicketProcedureStatus } from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import {
  TicketProductType,
} from '../../../../../../_libs/database/entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import {
  ProductPutawayManager,
  TicketChangeItemMoneyManager,
} from '../../../../../../_libs/database/operations'
import {
  TicketBatchRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../../socket/socket-emit.service'

@Injectable()
export class TicketCancelResultTicketProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPutawayManager: ProductPutawayManager
  ) { }

  async cancelResultTicketProcedure(props: {
    oid: number
    ticketId: string
    ticketProcedureId: string
  }) {
    const { oid, ticketId, ticketProcedureId } = props
    const time = Date.now()

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

      let commissionAmount = 0
      let costAmount = 0
      let imageDestroyedList: Image[] = []
      let productModifiedList: Product[] = []
      let batchModifiedList: Batch[] = []
      let ticketModified: Ticket
      let ticketUserDestroyedList: TicketUser[] = []
      let ticketProductProcedureDestroyList: TicketProduct[] = []
      let ticketBatchDestroyedList: TicketBatch[] = []

      if (ticketProcedureOrigin.imageIds !== '[]') {
        try {
          ticketProcedureOrigin.imageIdList = JSON.parse(ticketProcedureOrigin.imageIds)
        } catch (error) {
          ticketProcedureOrigin.imageIdList = []
        }
        const imageResponse = await this.imageManagerService.removeImageList({
          oid,
          idRemoveList: ticketProcedureOrigin.imageIdList,
        })
        imageDestroyedList = imageResponse.imageDestroyedList
      }

      ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
        oid,
        ticketId,
        positionType: { IN: [PositionType.ProcedureResult] },
        ticketItemId: ticketProcedureId,
      })
      commissionAmount = -ticketUserDestroyedList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.commissionMoney
      }, 0)

      ticketProductProcedureDestroyList = await this.ticketProductRepository.managerDelete(
        manager,
        {
          oid,
          ticketId,
          type: TicketProductType.Procedure,
          ticketProcedureId,
        }
      )
      if (ticketProductProcedureDestroyList.length) {
        costAmount = -ticketProductProcedureDestroyList.reduce((acc, item) => {
          return acc + item.costAmount
        }, 0)
        ticketBatchDestroyedList = await this.ticketBatchRepository.managerDelete(manager, {
          oid,
          ticketId,
          ticketProductId: { IN: ticketProductProcedureDestroyList.map((i) => i.id) },
        })

        const putawayContainer = await this.productPutawayManager.startPutaway({
          manager,
          oid,
          voucherId: ticketId,
          contactId: ticketOrigin.customerId,
          movementType: MovementType.Ticket,
          isRefund: 1,
          time,
          voucherBatchPutawayList: ticketBatchDestroyedList.map((i) => {
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
        productModifiedList = putawayContainer.productModifiedList
        batchModifiedList = putawayContainer.batchModifiedList
      }

      const itemsDiscountAdd = -ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
      const procedureMoneyAdd = -ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice

      const ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
        manager,
        { oid, id: ticketProcedureId },
        {
          costAmount: 0,
          commissionAmount: 0,
          imageIds: '[]',
          status: TicketProcedureStatus.Pending,
        }
      )

      if (
        costAmount !== 0
        || itemsDiscountAdd !== 0
        || procedureMoneyAdd !== 0
        || commissionAmount !== 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd,
            itemsDiscountAdd,
            commissionMoneyAdd: commissionAmount,
            itemsCostAmountAdd: costAmount,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        imageList: { destroyedList: imageDestroyedList },
        ticketUser: { destroyedList: ticketUserDestroyedList },
        ticketProcedure: { upsertedList: [ticketProcedureModified] },
        ticketProduct: { destroyedList: ticketProductProcedureDestroyList },
        ticketBatch: { upsertedList: ticketBatchDestroyedList },
      })
      await transaction.commit()
    } catch (error) {
      console.log('🚀 ~ ticket-update-result-ticket-procedure.service.ts:46 ~ ~ error:', error)
      await transaction.rollback()
    }
  }
}
