import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import { TicketProcedureStatus } from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'

@Injectable()
export class TicketDestroyTicketRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketRegimen(params: { oid: number; ticketId: string; ticketRegimenId: string }) {
    const { oid, ticketId, ticketRegimenId } = params
    const PREFIX = `ticketId=${ticketId} addTicketRegimen failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET REGIMEN ===
      const ticketRegimenDestroyed = await this.ticketRegimenRepository.managerDeleteOne(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
        status: { IN: [TicketRegimenStatus.Empty, TicketRegimenStatus.Pending] },
      })

      // === 3. DELETE TICKET_REGIMEN_ITEM ===
      const ticketRegimenItemDestroyedList = await this.ticketRegimenItemRepository.managerDelete(
        manager,
        { oid, ticketRegimenId }
      )

      ticketRegimenItemDestroyedList.forEach((i) => {
        if (
          [PaymentMoneyStatus.FullPaid, PaymentMoneyStatus.PendingPayment].includes(
            i.paymentMoneyStatus
          )
        ) {
          throw new Error('Không thể xóa liệu trình đã thanh toán')
        }
        if (i.quantityFinish > 0) {
          throw new Error('Không thể xóa liệu trình đã thực hiện')
        }
      })

      const ticketProcedureDestroyedList = await this.ticketProcedureRepository.managerDelete(
        manager,
        { oid, ticketRegimenId }
      )

      ticketProcedureDestroyedList.forEach((i) => {
        if (i.status === TicketProcedureStatus.Completed) {
          throw new Error('Không thể xóa liệu trình đã thực hiện')
        }
        if (
          [PaymentMoneyStatus.PendingPayment, PaymentMoneyStatus.PartialPaid].includes(
            i.paymentMoneyStatus
          )
        ) {
          throw new Error('Không thể xóa liệu trình đã thanh toán')
        }
      })

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
        oid,
        positionType: { IN: [PositionType.RegimenRequest] },
        ticketId,
        ticketItemId: ticketRegimenDestroyed.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const procedureMoneyDelete = ticketRegimenItemDestroyedList.reduce((acc, item) => {
        return acc + item.quantityPayment * item.actualPrice
      }, 0)
      const itemsDiscountDelete = ticketRegimenItemDestroyedList.reduce((acc, item) => {
        return acc + item.quantityPayment * item.discountMoney
      }, 0)
      const commissionMoneyDelete = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyDelete != 0 || itemsDiscountDelete != 0 || commissionMoneyDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: -procedureMoneyDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketUser: { destroyedList: ticketUserDestroyedList || [] },
        ticketRegimen: { destroyedList: [ticketRegimenDestroyed] },
        ticketRegimenItem: { destroyedList: ticketRegimenItemDestroyedList },
        ticketProcedure: { destroyedList: ticketProcedureDestroyedList },
      })

      return {
        ticketModified,
        ticketRegimenDestroyed,
        ticketRegimenItemDestroyedList,
        ticketProcedureDestroyedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}
