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
import { CustomerManager, PaymentManager, TicketManager } from '../../repositories'

@Injectable()
export class CustomerPrepaymentMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketManager: TicketManager
  ) { }

  async startPrePaymentMoney(options: {
    oid: number
    ticketId: string
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
  }) {
    const { oid, ticketId, customerId, cashierId, paymentMethodId, time, paidAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          customerId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        {
          paid: () => `paid + ${paidAmount}`,
          debt: () => `debt - ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                              ELSE ${TicketStatus.Executing}
                          END`,
        }
      )

      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Ticket,
        voucherId: ticketModified.id,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.In,
        note: note || '',

        paidAmount,
        paymentActionType: PaymentActionType.PrepaymentMoney,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      return { ticketModified, paymentCreated, customer }
    })

    return transaction
  }
}
