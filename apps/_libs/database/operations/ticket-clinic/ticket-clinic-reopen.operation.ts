import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentType } from '../../common/variable'
import { Customer } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, CustomerPaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketClinicReopenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async reopen(params: { oid: number; ticketId: number; time: number; description: string }) {
    const { oid, ticketId, time, description } = params
    const PREFIX = `ticketId=${ticketId} reopen failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Debt, TicketStatus.Completed] },
        },
        { ticketStatus: TicketStatus.Executing, profit: 0, itemsDiscount: 0, endedAt: null }
      )

      let customer: Customer
      if (ticket.debt > 0) {
        customer = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticket.customerId },
          { debt: () => `debt - ${ticket.debt}` }
        )
        // === 2. UPDATE CUSTOMER ===
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + ticket.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId: ticket.customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.Reopen,
          paid: 0,
          debit: -ticket.debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: '',
          description,
        }
        const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
          manager,
          customerPaymentInsert
        )
      }
      return { ticket, customer }
    })
  }
}
