import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  TicketManager,
} from '../../managers'
import { PaymentManager } from '../../repositories'

@Injectable()
export class CustomerRefundMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketManager: TicketManager

  ) { }

  async startRefundMoney(options: {
    oid: number
    ticketId: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    refundAmount: number
    note: string
  }) {
    const { oid, ticketId, customerId, cashierId, paymentMethodId, time, refundAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: { IN: [TicketStatus.Deposited, TicketStatus.Executing] },
          paid: { GTE: refundAmount },
        },
        {
          paid: () => `paid - ${refundAmount}`,
          debt: () => `debt + ${refundAmount}`,
        }
      )

      // === 2. CUSTOMER: query ===
      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: ticketModified.customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Ticket,
        voucherId: ticketModified.id,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.Out,
        paymentActionType: PaymentActionType.RefundMoney,
        note: note || '',

        paidAmount: refundAmount,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      return { ticketModified, customer, paymentCreated }
    })
    return transaction
  }
}
