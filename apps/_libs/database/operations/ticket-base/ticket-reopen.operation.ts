import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentType } from '../../common/variable'
import { Customer } from '../../entities'
import CustomerPayment, { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, CustomerPaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketReopenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async reopen(params: {
    oid: number
    ticketId: number
    paymentMethodId: number
    time: number
    description: string
  }) {
    const { oid, ticketId, paymentMethodId, time, description } = params
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
        { ticketStatus: TicketStatus.Executing, endedAt: null }
      )

      let customer: Customer
      let customerPayment: CustomerPayment
      if (ticket.debt > 0) {
        customer = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticket.customerId },
          { debt: () => `debt - ${ticket.debt}` }
        )
        if (!customer) {
          throw new Error(`Khách hàng không tồn tại trên hệ thống`)
        }
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
          paymentMethodId,
          paid: 0,
          debit: -ticket.debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: '',
          description,
        }
        customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
          manager,
          customerPaymentInsert
        )
      }
      return { ticket, customer, customerPayment }
    })
  }
}
