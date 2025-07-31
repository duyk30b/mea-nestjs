import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Customer } from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, TicketManager } from '../../managers'
import { PaymentManager } from '../../repositories'

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
      const paymentCreatedList: Payment[] = []
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
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: ticketModified.customerId,

          cashierId: userId,
          paymentMethodId: 0,
          createdAt: time,
          paymentActionType: PaymentActionType.Reopen,
          moneyDirection: MoneyDirection.Other,

          paidAmount: 0,
          debtAmount: -ticketModified.debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: note || '',
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )
        paymentCreatedList.push(paymentCreated)
      }

      return {
        ticketModified,
        customerModified: customerModified as Customer | undefined,
        paymentCreatedList,
      }
    })

    return transaction
  }
}
