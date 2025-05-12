import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Customer } from '../../entities'
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
export class TicketReopenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async reopen(params: {
    oid: number
    ticketId: number
    cashierId: number
    paymentMethodId: number
    time: number
    newPaid: number | null // null là không set giá trị mới, giữ nguyên hiện tại
    note: string
    description: string
  }) {
    const { oid, ticketId, paymentMethodId, time, description, note, cashierId } = params
    let newPaid = params.newPaid
    const PREFIX = `ticketId=${ticketId} reopen failed`
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { endedAt: null }
      )
      if (newPaid == null) newPaid = ticketOrigin.paid
      
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: { IN: [TicketStatus.Debt, TicketStatus.Completed] },
        },
        {
          paid: newPaid,
          debt: () => `"totalMoney" - ${newPaid}`,
          status: TicketStatus.Executing,
          endedAt: null,
        }
      )

      if (ticketOrigin.paid === ticketModified.paid && ticketOrigin.debt === 0) {
        return { ticket: ticketModified } // truờng hợp này thì chả thanh toán gì
      }

      // === 2. CUSTOMER: query ===
      let customer: Customer
      if (ticketOrigin.debt > 0) {
        customer = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketOrigin.customerId },
          { debt: () => `debt - ${ticketOrigin.debt}` }
        )
      } else {
        customer = await this.customerManager.findOneBy(manager, {
          oid,
          id: ticketOrigin.customerId,
        })
      }
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }
      // === 2. UPDATE CUSTOMER ===
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + ticketOrigin.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        cashierId,
        paymentMethodId,
        voucherType: VoucherType.Ticket,
        voucherId: ticketId,
        personType: PersonType.Customer,
        personId: ticketOrigin.customerId,
        createdAt: time,

        paymentTiming: PaymentTiming.Reopen,
        moneyDirection: MoneyDirection.Out,
        paidAmount: ticketModified.paid - ticketOrigin.paid,
        debtAmount: -ticketOrigin.debt,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note,
        description,
      }
      const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)
      return { ticket: ticketModified, customer, payment }
    })
  }
}
