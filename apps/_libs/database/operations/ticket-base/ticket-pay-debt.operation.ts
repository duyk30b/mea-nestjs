import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, PaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async payDebt(params: {
    oid: number
    ticketId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
    cashierId: number
  }) {
    const { oid, ticketId, paymentMethodId, time, money, note, cashierId } = params
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
          status: TicketStatus.Debt,
        },
        {
          status: () => `CASE 
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
      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        voucherType: VoucherType.Ticket,
        voucherId: ticketId,
        personType: PersonType.Customer,
        personId: ticket.customerId,
        paymentTiming: PaymentTiming.PayDebt,
        createdAt: time,
        moneyDirection: MoneyDirection.In,
        paidAmount: money,
        debtAmount: -money,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        cashierId,
        note,
        description: '',
      }
      const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

      return { ticket, payment, customer }
    })
  }
}
