import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, PaymentManager, TicketManager } from '../../repositories'

@Injectable()
export class TicketReopenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async reopen(props: { oid: number; ticketId: string }) {
    const { oid, ticketId } = props
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: { IN: [TicketStatus.Debt, TicketStatus.Completed] } },
        { endedAt: null, status: TicketStatus.Executing }
      )

      return {
        ticketModified,
      }
    })

    return transaction
  }
}
