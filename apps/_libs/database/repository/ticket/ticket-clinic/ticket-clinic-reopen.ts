import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentType } from '../../../common/variable'
import { Customer, CustomerPayment, Ticket } from '../../../entities'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicReopen {
  constructor(private dataSource: DataSource) { }

  async reopen(params: {
    oid: number
    ticketId: number
    time: number
    description: string
  }) {
    const { oid, ticketId, time, description } = params
    const PREFIX = `ticketId=${ticketId} reopen failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Debt, TicketStatus.Completed]),
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: TicketStatus.Executing,
        profit: 0,
        itemsDiscount: 0,
        endedAt: null,
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

      let customer: Customer
      if (ticket.debt > 0) {
        const whereCustomer: FindOptionsWhere<Customer> = { oid, id: ticket.customerId }
        const customerUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Customer)
          .where(whereCustomer)
          .set({
            debt: () => `debt - ${ticket.debt}`,
          })
          .returning('*')
          .execute()
        if (customerUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: customerId=${ticket.customerId} update failed`)
        }
        customer = Customer.fromRaw(customerUpdateResult.raw[0])

        // === 2. UPDATE CUSTOMER ===
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + ticket.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const customerPaymentDraft: CustomerPaymentInsertType = {
          oid,
          customerId: ticket.customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.Reopen,
          paid: 0,
          debit: -ticket.debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: '',
          description,
        }
        const customerPaymentInsertResult = await manager.insert(
          CustomerPayment,
          customerPaymentDraft
        )
        const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
        if (!customerPaymentId) {
          throw new Error(
            `${PREFIX}: Insert CustomerPayment failed:`
            + ` ${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
      }
      return { ticketBasic: ticket, customer }
    })
  }
}
