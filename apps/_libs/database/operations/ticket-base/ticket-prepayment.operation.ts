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
export class TicketPrepaymentOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async prepayment(params: {
    oid: number
    ticketId: number
    cashierId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
  }) {
    const { oid, ticketId, paymentMethodId, time, money, note, cashierId } = params
    const PREFIX = `ticketId=${ticketId} prepayment failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [
              TicketStatus.Schedule,
              TicketStatus.Draft,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        {
          status: () => `CASE 
              WHEN("status" IN (${TicketStatus.Schedule}, ${TicketStatus.Draft})) 
                  THEN ${TicketStatus.Deposited} 
              ELSE "status"
            END
          `,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
        }
      )

      if (money === 0) return { ticket } // Không thanh toán thì thôi, không ghi nữa, chuyển trạng thái là được rồi

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
        cashierId,
        paymentMethodId,
        voucherType: VoucherType.Ticket,
        voucherId: ticketId,
        personType: PersonType.Customer,
        personId: ticket.customerId,

        paymentTiming: PaymentTiming.Prepayment,
        createdAt: time,
        moneyDirection: MoneyDirection.In,
        paidAmount: money,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note,
        description: '',
      }
      const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)
      return { ticket, customer, payment }
    })
  }
}
