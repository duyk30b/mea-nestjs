import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, InsertResult, Raw, UpdateResult } from 'typeorm'
import { DTimer } from '../../../../common/helpers/time.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, PaymentType } from '../../../common/variable'
import { Customer, CustomerPayment, Ticket } from '../../../entities'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketPaymentAndClose {
  constructor(private dataSource: DataSource) { }

  async paymentAndClose(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} close failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Draft, TicketStatus.Approved, TicketStatus.Executing]),
        deliveryStatus: In([
          DeliveryStatus.NoStock,
          DeliveryStatus.Delivered,
        ]),
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: () => `CASE 
                              WHEN("totalMoney" = paid + ${money}) THEN ${TicketStatus.Completed} 
                              ELSE ${TicketStatus.Debt} 
                            END
                          `,
        paid: () => `paid + ${money}`,
        debt: () => `debt - ${money}`,
        endedAt: time,
        year: DTimer.info(time, 7).year,
        month: DTimer.info(time, 7).month + 1,
        date: DTimer.info(time, 7).date,
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

      if (ticket.debt == 0 && money == 0) return { ticketBasic: ticket }

      let customer: Customer
      if (ticket.debt > 0) {
        const whereCustomer: FindOptionsWhere<Customer> = { oid, id: ticket.customerId }
        const customerUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Customer)
          .where(whereCustomer)
          .set({
            debt: () => `debt + ${ticket.debt}`,
          })
          .returning('*')
          .execute()
        if (customerUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: customerId=${ticket.customerId} update failed`)
        }
        customer = Customer.fromRaw(customerUpdateResult.raw[0])
      } else {
        customer = await manager.findOneBy(Customer, { oid, id: ticket.customerId })
      }

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt - ticket.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: ticket.customerId,
        ticketId,
        createdAt: time,
        paymentType: PaymentType.Close,
        paid: money,
        debit: ticket.debt,
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
      //     `${PREFIX}: Insert CustomerPayment failed:` +
      //       ` ${JSON.stringify(customerPaymentInsertResult)}`
      //   )
      // }

      const customerPaymentInsertResult: InsertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(CustomerPayment)
        .values(customerPaymentInsert)
        .returning('*')
        .execute()

      const customerPaymentList = CustomerPayment.fromRaws(customerPaymentInsertResult.raw)

      if (!customerPaymentList.length) {
        throw new Error(
          `${PREFIX}: Insert CustomerPayment failed: `
          + `${JSON.stringify(customerPaymentInsertResult)}`
        )
      }
      const customerPayment: CustomerPayment = customerPaymentList[0]

      return { ticketBasic: ticket, customer, customerPayment }
    })
  }
}
