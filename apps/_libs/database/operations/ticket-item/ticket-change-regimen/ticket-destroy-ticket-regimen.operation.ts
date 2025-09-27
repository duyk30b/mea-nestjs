import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus, TicketRegimenStatus } from '../../../common/variable'
import { PositionType } from '../../../entities/position.entity'
import { TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketRegimenOperation {
  constructor(
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
        paymentMoneyStatus: PaymentMoneyStatus.PendingPaid,
        status: { IN: [TicketRegimenStatus.Empty, TicketRegimenStatus.Pending] },
      })

      // === 3. DELETE TICKET_REGIMEN_ITEM ===
      const ticketRegimenItemDestroyedList = await this.ticketRegimenItemRepository.managerDelete(
        manager,
        { oid, ticketRegimenId }
      )

      const ticketProcedureDestroyedList = await this.ticketProcedureRepository.managerDelete(
        manager,
        { oid, ticketRegimenId }
      )

      ticketProcedureDestroyedList.forEach((i) => {
        if (i.status === TicketProcedureStatus.Completed) {
          throw new Error('Không thể xóa liệu trình đã thực hiện')
        }
        if (i.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
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
      const procedureMoneyDelete = ticketRegimenDestroyed.actualPrice
      const itemsDiscountDelete = ticketRegimenDestroyed.discountMoney
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
