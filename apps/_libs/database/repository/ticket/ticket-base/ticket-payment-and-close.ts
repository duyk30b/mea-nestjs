import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, InsertResult, Raw, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentType } from '../../../common/variable'
import {
  Customer,
  CustomerPayment,
  Ticket,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
} from '../../../entities'
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
      // === 1. TICKET: Update status để tạo transaction ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Executing]),
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const ticketUpdateTime = await manager.update(Ticket, whereTicket, {
        updatedAt: Date.now(),
      }) // update tạm để tạo transaction
      if (ticketUpdateTime.affected !== 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      // === 2. TICKET: Update profit and discountItems ===
      const ticketProcedureList = await manager.find(TicketProcedure, {
        where: { ticketId },
      })
      const ticketProductList = await manager.find(TicketProduct, {
        where: { ticketId },
      })
      const ticketLaboratoryList = await manager.find(TicketLaboratory, {
        where: { ticketId },
      })
      const ticketRadiologyList = await manager.find(TicketRadiology, {
        where: { ticketId },
      })

      const procedureDiscount = ticketProcedureList.reduce((acc, item) => {
        return acc + item.discountMoney * item.quantity
      }, 0)
      const productDiscount = ticketProductList.reduce((acc, item) => {
        return acc + item.discountMoney * item.quantity
      }, 0)
      const laboratoryDiscount = ticketLaboratoryList.reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
      const radiologyDiscount = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
      const itemsDiscount =
        procedureDiscount + productDiscount + laboratoryDiscount + radiologyDiscount

      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: () => `CASE 
                                WHEN("totalMoney" = paid + ${money}) THEN ${TicketStatus.Completed} 
                                ELSE ${TicketStatus.Debt} 
                              END
                            `,
        paid: () => `paid + ${money}`,
        debt: () => `debt - ${money}`,
        itemsDiscount,
        profit: () => `"totalMoney" - "totalCostAmount" - "expense"`,
        endedAt: time,
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
