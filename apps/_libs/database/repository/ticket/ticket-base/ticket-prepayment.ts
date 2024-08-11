import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, InsertResult, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentType } from '../../../common/variable'
import { Customer, CustomerPayment, Ticket } from '../../../entities'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketPrepayment {
  constructor(private dataSource: DataSource) { }

  async prepayment(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} prepayment failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([
          TicketStatus.Schedule,
          TicketStatus.Draft,
          TicketStatus.Approved,
          TicketStatus.Executing,
        ]),
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: () => `CASE 
            WHEN("ticketStatus" IN (${TicketStatus.Schedule}, ${TicketStatus.Draft})) 
                THEN ${TicketStatus.Approved} 
            ELSE "ticketStatus"
          END
        `,
        paid: () => `paid + ${money}`,
        debt: () => `debt - ${money}`,
      }
      const ticketUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticket = Ticket.fromRaw(ticketUpdateResult.raw[0])

      // === 2. CUSTOMER: query ===
      const customer = await manager.findOneBy(Customer, {
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

      // const customerPaymentInsertResult = await manager.insert(
      //   CustomerPayment,
      //   customerPaymentInsert
      // )
      // const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      // if (!customerPaymentId) {
      //   throw new Error(
      //     `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
      //   )
      // }

      const customerPaymentInsertResult: InsertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(CustomerPayment)
        .values(customerPaymentInsert)
        .returning('*')
        .execute()

      const [customerPayment] = CustomerPayment.fromRaws(customerPaymentInsertResult.raw)

      if (!customerPayment) {
        throw new Error(
          `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      return { ticketBasic: ticket, customer, customerPayment }
    })
  }
}
