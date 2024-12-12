import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentType } from '../../common/variable'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, CustomerPaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async payDebt(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} pay debt failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: TicketStatus.Debt,
        },
        {
          ticketStatus: () => `CASE 
              WHEN("totalMoney" > paid + ${money}) THEN ${TicketStatus.Debt} 
              ELSE ${TicketStatus.Completed} 
            END
          `,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
        }
      )
      if (ticket.paid > ticket.totalMoney) {
        throw new Error(`${PREFIX}: Money invalid, ticket=${ticket}`)
      }
      // === 2. UPDATE CUSTOMER ===
      const customer = await this.customerManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticket.customerId },
        { debt: () => `debt - ${money}` }
      )

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + money

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: ticket.customerId,
        ticketId,
        createdAt: time,
        paymentType: PaymentType.PayDebt,
        paid: money,
        debit: -money, //
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }
      const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
        manager,
        customerPaymentInsert
      )

      return { ticket, customerPayment, customer }
    })
  }
}
