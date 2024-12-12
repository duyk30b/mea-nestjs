import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentType } from '../../common/variable'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, CustomerPaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketPrepaymentOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async prepayment(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} prepayment failed`

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
          ticketStatus: {
            IN: [
              TicketStatus.Schedule,
              TicketStatus.Draft,
              TicketStatus.Approved,
              TicketStatus.Executing,
            ],
          },
        },
        {
          ticketStatus: () => `CASE 
              WHEN("ticketStatus" IN (${TicketStatus.Schedule}, ${TicketStatus.Draft})) 
                  THEN ${TicketStatus.Approved} 
              ELSE "ticketStatus"
            END
          `,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
        }
      )

      // === 2. CUSTOMER: query ===
      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: ticket.customerId,
      })
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: ticket.customerId,
        ticketId,
        createdAt: time,
        paymentType: PaymentType.Prepayment,
        paid: money,
        debit: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }
      const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
        manager,
        customerPaymentInsert
      )
      return { ticket, customer, customerPayment }
    })
  }
}
