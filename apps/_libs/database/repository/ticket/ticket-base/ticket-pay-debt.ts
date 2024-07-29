import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, InsertResult, Raw, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentType } from '../../../common/variable'
import { Customer, CustomerPayment, Ticket } from '../../../entities'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketPayDebt {
  constructor(private dataSource: DataSource) { }

  async payDebt(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} pay debt failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Debt,
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: () => `CASE 
                              WHEN("totalMoney" > paid + ${money}) THEN ${TicketStatus.Debt} 
                              ELSE ${TicketStatus.Completed} 
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

      // === 2. UPDATE CUSTOMER ===
      const whereCustomer: FindOptionsWhere<Customer> = { oid, id: ticket.customerId }
      const customerUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Customer)
        .where(whereCustomer)
        .set({
          debt: () => `debt - ${money}`,
        })
        .returning('*')
        .execute()
      if (customerUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: customerId=${ticket.customerId} update failed`)
      }
      const customer = Customer.fromRaw(customerUpdateResult.raw[0])

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + money

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: ticket.customerId,
        ticketId,
        createdAt: time,
        paymentType: PaymentType.PayDebt,
        paid: money,
        debit: -money, //
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

      return { ticketBasic: ticket, customerPayment, customer }
    })
  }
}
