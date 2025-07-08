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
export class TicketRefundOverpaidOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async refundOverpaid(params: {
    oid: number
    ticketId: number
    cashierId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
    description: string
  }) {
    const { oid, ticketId, paymentMethodId, time, money, note, cashierId, description } = params
    const PREFIX = `ticketId=${ticketId} refund overpaid failed`

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
          status: { IN: [TicketStatus.Deposited, TicketStatus.Executing] },
        },
        {
          paid: () => `paid - ${money}`,
          debt: () => `debt + ${money}`,
        }
      )
      if (ticket.paid < 0) {
        throw new Error(`${PREFIX}: Money invalid, ticket=${ticket}`)
      }

      // === 2. CUSTOMER: query ===
      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: ticket.customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        voucherType: VoucherType.Ticket,
        voucherId: ticketId,
        personType: PersonType.Customer,
        personId: ticket.customerId,
        paymentTiming: PaymentTiming.ReceiveRefund,
        createdAt: time,
        moneyDirection: MoneyDirection.Out,
        paidAmount: -money,
        debtAmount: 0, // refund overpaid không phát sinh nợ
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        cashierId,
        note,
        description,
      }

      const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

      return { ticket, payment, customer }
    })
  }
}
