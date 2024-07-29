import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, FindOptionsWhere, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import { PaymentType } from '../../common/variable'
import { Customer, CustomerPayment } from '../../entities'
import {
  CustomerPaymentInsertType,
  CustomerPaymentRelationType,
} from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class CustomerPaymentRepository extends PostgreSqlRepository<
  CustomerPayment,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in keyof CustomerPaymentRelationType]?: boolean }
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CustomerPayment)
    private readonly customerPaymentRepository: Repository<CustomerPayment>
  ) {
    super(customerPaymentRepository)
  }

  async startPayDebt(options: {
    oid: number
    customerId: number
    time: number
    ticketPaymentList: { ticketId: number; money: number }[]
    note?: string
  }) {
    const { oid, customerId, ticketPaymentList, time, note } = options
    const PREFIX = `customerId=${customerId} pay debt failed`

    const totalMoney = ticketPaymentList.reduce((acc, cur) => {
      if (cur.money <= 0) {
        throw new Error(`${PREFIX}: Money number invalid`)
      }
      return acc + cur.money
    }, 0)

    if (totalMoney <= 0) {
      throw new Error(`${PREFIX}: Money number invalid`)
    }
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const whereCustomer: FindOptionsWhere<Customer> = {
        oid,
        id: customerId,
        debt: MoreThanOrEqual(totalMoney),
      }
      const customerUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Customer)
        .where(whereCustomer)
        .set({
          debt: () => `debt - ${totalMoney}`,
        })
        .returning('*')
        .execute()
      if (customerUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: customerId=${customerId} update failed`)
      }
      const customer = Customer.fromRaw(customerUpdateResult.raw[0])

      const customerCloseDebt = customer.debt
      let customerOpenDebt = customerCloseDebt + totalMoney

      const customerPaymentInsertList: CustomerPaymentInsertType[] = []
      let description = ''
      if (ticketPaymentList.length) {
        description =
          `Trả ${formatNumber(totalMoney)} vào các phiếu nợ: `
          + `${ticketPaymentList.map((i) => 'T' + i.ticketId).join(',')}`
      }

      // === 3. UPDATE VISIT ===
      if (ticketPaymentList.length) {
        const ticketUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Ticket" ticket
          SET "paid"            = ticket."paid" + temp."money",
              "debt"            = ticket."debt" - temp."money",
              "ticketStatus"    = CASE 
                                    WHEN(ticket."debt" = temp."money") 
                                        THEN ${TicketStatus.Completed} 
                                    ELSE ${TicketStatus.Debt}
                                  END
          FROM (VALUES `
          + ticketPaymentList.map((i) => `(${i.ticketId}, ${i.money})`).join(', ')
          + `   ) AS temp("ticketId", "money")
          WHERE   ticket."oid"          = ${oid} 
              AND ticket."id"           = temp."ticketId" 
              AND ticket."customerId"   = ${customerId}
              AND ticket."ticketStatus" = ${TicketStatus.Debt}
              AND ticket."debt"         >= temp."money";
          `
        )
        if (ticketUpdateResult[1] != ticketPaymentList.length) {
          throw new Error(`${PREFIX}: Update Ticket failed, affected = ${ticketUpdateResult[1]}`)
        }

        ticketPaymentList.forEach((i) => {
          const customerPaymentInsert: CustomerPaymentInsertType = {
            oid,
            customerId,
            ticketId: i.ticketId,
            createdAt: time,
            paymentType: PaymentType.PayDebt,
            paid: i.money,
            debit: -i.money,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt - i.money,
            note: note || '',
            description,
          }
          customerOpenDebt = customerPaymentInsert.closeDebt
          customerPaymentInsertList.push(customerPaymentInsert)
        })
      }

      const customerPaymentInsertResult = await manager.insert(
        CustomerPayment,
        customerPaymentInsertList
      )

      if (customerPaymentInsertResult.identifiers.length !== customerPaymentInsertList.length) {
        throw new Error(
          `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      return { customer }
    })
  }
}
