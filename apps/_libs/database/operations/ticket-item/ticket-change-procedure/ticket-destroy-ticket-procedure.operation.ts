import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../common/variable'
import { PositionType } from '../../../entities/position.entity'
import { TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketProcedure(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PROCEDURE ===
      const ticketProcedureDestroyed = await this.ticketProcedureManager.deleteOneAndReturnEntity(
        manager,
        {
          oid,
          ticketId,
          id: ticketProcedureId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.PendingPayment, PaymentMoneyStatus.TicketPaid] },
          status: { IN: [TicketProcedureStatus.NoEffect, TicketProcedureStatus.Pending] },
          costAmount: 0, // nếu có costAmount thì phải hủy kết quả trước
        }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        positionType: {
          IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult],
        },
        ticketId,
        ticketItemId: ticketProcedureDestroyed.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const procedureMoneyDelete =
        ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.actualPrice
      const itemsDiscountDelete =
        ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.discountMoney
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

      return { ticketModified, ticketProcedureDestroyed, ticketUserDestroyedList }
    })

    return transaction
  }
}
