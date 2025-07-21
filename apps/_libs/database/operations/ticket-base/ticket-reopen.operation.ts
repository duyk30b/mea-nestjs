import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Customer } from '../../entities'
import PaymentItem, {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { PaymentPersonType } from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, TicketManager } from '../../managers'
import { PaymentItemManager } from '../../repositories'

@Injectable()
export class TicketReopenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentItemManager: PaymentItemManager
  ) { }

  async reopen(params: {
    oid: number
    ticketId: number
    time: number
    userId: number
    note: string
  }) {
    const { oid, userId, ticketId, time, note } = params
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { endedAt: null, status: TicketStatus.Executing }
      )

      let customerModified: Customer
      const paymentItemCreatedList: PaymentItem[] = []
      if (ticketModified.debt > 0) {
        customerModified = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketModified.customerId },
          { debt: () => `debt - ${ticketModified.debt}` }
        )

        // === 2. UPDATE CUSTOMER ===
        const customerCloseDebt = customerModified.debt
        const customerOpenDebt = customerCloseDebt + ticketModified.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const paymentItemInsert: PaymentItemInsertType = {
          oid,
          paymentId: 0,
          paymentPersonType: PaymentPersonType.Customer,
          personId: ticketModified.customerId,
          createdAt: time,

          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          voucherItemType: PaymentVoucherItemType.Other,
          voucherItemId: 0,
          paymentInteractId: 0,

          paidAmount: 0,
          debtAmount: -ticketModified.debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          cashierId: userId,
          note: note || '',
        }
        const paymentItemCreated = await this.paymentItemManager.insertOneAndReturnEntity(
          manager,
          paymentItemInsert
        )
        paymentItemCreatedList.push(paymentItemCreated)
      }

      return {
        ticketModified,
        customerModified: customerModified as Customer | undefined,
        paymentItemCreatedList,
      }
    })

    return transaction
  }
}
