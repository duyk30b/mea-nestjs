import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketUserManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketUserOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketUser(params: { oid: number; ticketId: number; ticketUserId: number }) {
    const { oid, ticketId, ticketUserId } = params
    const PREFIX = `ticketId=${ticketId} addTicketRadiology failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroy = await this.ticketUserManager.deleteOneAndReturnEntity(manager, {
        oid,
        id: ticketUserId,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const commissionMoneyDelete = ticketUserDestroy.commissionMoney * ticketUserDestroy.quantity

      let ticket: Ticket = ticketOrigin
      if (commissionMoneyDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      return { ticket, ticketUserDestroy }
    })

    return transaction
  }
}
