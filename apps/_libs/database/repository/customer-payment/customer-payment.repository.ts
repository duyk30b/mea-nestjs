import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, FindOptionsWhere, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import { InvoiceStatus, PaymentType, VoucherType } from '../../common/variable'
import { Customer, CustomerPayment } from '../../entities'
import {
  CustomerPaymentInsertType,
  CustomerPaymentRelationType,
} from '../../entities/customer-payment.entity'
import { VisitStatus } from '../../entities/visit.entity'
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
    invoicePaymentList: { invoiceId: number; money: number }[]
    visitPaymentList: { visitId: number; money: number }[]
    note?: string
  }) {
    const { oid, customerId, invoicePaymentList, visitPaymentList, time, note } = options
    const PREFIX = `customerId=${customerId} pay debt failed`

    const totalMoney =
      invoicePaymentList.reduce((acc, cur) => acc + cur.money, 0) +
      visitPaymentList.reduce((acc, cur) => acc + cur.money, 0)

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
      const description =
        `Trả ${formatNumber(totalMoney)} vào các phiếu nợ: ` +
        `${[invoicePaymentList.map((i) => 'IV' + i.invoiceId), visitPaymentList.map((i) => 'VS' + i.visitId)].flat().join(',')}`
      // === 2. UPDATE INVOICE ===
      if (invoicePaymentList.length) {
        const invoiceUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Invoice" iv
          SET "paid"    = iv."paid" + temp."money",
              "debt"    = iv."debt" - temp."money",
              "status"  = CASE 
                            WHEN(iv."debt" = temp."money") THEN ${InvoiceStatus.Success} 
                            ELSE ${InvoiceStatus.Debt}
                          END
          FROM (VALUES ` +
            invoicePaymentList.map((i) => `(${i.invoiceId}, ${i.money})`).join(', ') +
            `   ) AS temp("invoiceId", "money")
          WHERE   iv."oid" = ${oid} 
              AND iv."id" = temp."invoiceId" 
              AND iv."customerId" = ${customerId}
              AND iv."status" = ${InvoiceStatus.Debt}
              AND iv."debt" >= temp."money";
          `
        )
        if (invoiceUpdateResult[1] != invoicePaymentList.length) {
          throw new Error(`${PREFIX}: Update Invoice failed, affected = ${invoiceUpdateResult[1]}`)
        }

        invoicePaymentList.forEach((i) => {
          const customerPaymentInsert: CustomerPaymentInsertType = {
            oid,
            customerId,
            voucherId: i.invoiceId,
            voucherType: VoucherType.Invoice,
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

      // === 3. UPDATE VISIT ===
      if (visitPaymentList.length) {
        const visitUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Visit" vs
          SET "paid"    = vs."paid" + temp."money",
              "debt"    = vs."debt" - temp."money",
              "visitStatus"  = CASE 
                            WHEN(vs."debt" = temp."money") THEN ${VisitStatus.Completed} 
                            ELSE ${VisitStatus.Debt}
                          END
          FROM (VALUES ` +
            visitPaymentList.map((i) => `(${i.visitId}, ${i.money})`).join(', ') +
            `   ) AS temp("visitId", "money")
          WHERE   vs."oid" = ${oid} 
              AND vs."id" = temp."visitId" 
              AND vs."customerId" = ${customerId}
              AND vs."visitStatus" = ${VisitStatus.Debt}
              AND vs."debt" >= temp."money";
          `
        )
        if (visitUpdateResult[1] != visitPaymentList.length) {
          throw new Error(`${PREFIX}: Update Visit failed, affected = ${visitUpdateResult[1]}`)
        }

        visitPaymentList.forEach((i) => {
          const customerPaymentInsert: CustomerPaymentInsertType = {
            oid,
            customerId,
            voucherId: i.visitId,
            voucherType: VoucherType.Visit,
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
