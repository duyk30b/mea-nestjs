import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { MoneyDirection, PaymentInsertType, PaymentPersonType } from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, TicketManager } from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class CustomerRefundOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private ticketManager: TicketManager
  ) { }

  async startRefund(options: {
    oid: number
    customerId: number
    cashierId: number
    ticketId: number
    money: number
    time: number
    paymentMethodId: number
    reason: string
    note: string
  }) {
    const { oid, paymentMethodId, customerId, ticketId, time, cashierId, money, reason, note } =
      options
    if (money <= 0) {
      throw new BusinessError('Số tiền hoàn trả không hợp lệ', { money })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
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
      if (ticketModified.paid < 0) {
        throw new BusinessError(`Số tiền hoàn trả vượt quá số tiền cho phép`, {
          money,
          paidOrigin: ticketModified.paid + money,
        })
      }

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
        paymentMethodId,
        paymentPersonType: PaymentPersonType.Customer,
        personId: customerId,
        createdAt: time,
        moneyDirection: MoneyDirection.Out,
        money,
        cashierId,
        note: note || '',
        reason: reason || '',
      }

      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      // === 4. INSERT CUSTOMER_PAYMENT ===
      const paymentItemInsert: PaymentItemInsertType = {
        oid,
        paymentId: paymentCreated.id,
        personId: customerId,
        paymentPersonType: PaymentPersonType.Customer,
        voucherType: PaymentVoucherType.Ticket,
        voucherId: ticketId,
        voucherItemType: PaymentVoucherItemType.Other,
        voucherItemId: 0,
        paymentInteractId: 0,
        note: note || '',
        createdAt: time,
        cashierId,

        expectedPrice: -money,
        actualPrice: -money,
        quantity: 1,
        discountMoney: 0,
        discountPercent: 0,
        paidAmount: -money,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
      }

      const paymentItemCreated = await this.paymentItemManager.insertOneAndReturnEntity(
        manager,
        paymentItemInsert
      )

      return { ticketModified, paymentCreated, paymentItemCreated, customer }
    })
    return transaction
  }
}
