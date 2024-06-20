import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PaymentType, VoucherType } from '../../common/variable'
import { Customer, CustomerPayment, Visit } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitPrepayment {
  constructor(private dataSource: DataSource) {}

  async prepayment(params: { oid: number; visitId: number; time: number; money: number }) {
    const { oid, visitId, time, money } = params
    const PREFIX = `visitId=${visitId} prepayment failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. INVOICE: update ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: In([VisitStatus.Scheduled, VisitStatus.Waiting, VisitStatus.InProgress]),
      }
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        paid: () => `paid + ${money}`,
        debt: () => `debt - ${money}`,
      }
      const visitUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Visit)
        .where(whereVisit)
        .set(setVisit)
        .returning('*')
        .execute()
      if (visitUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Visit failed`)
      }
      const visit = Visit.fromRaw(visitUpdateResult.raw[0])

      // === 2. CUSTOMER: query ===
      const customer = await manager.findOneBy(Customer, {
        oid,
        id: visit.customerId,
      })
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: visit.customerId,
        voucherId: visitId,
        voucherType: VoucherType.Visit,
        createdAt: time,
        paymentType: PaymentType.Prepayment,
        paid: money,
        debit: 0, // refund prepayment không phát sinh nợ
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }

      const customerPaymentInsertResult = await manager.insert(
        CustomerPayment,
        customerPaymentInsert
      )
      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      // const customerPaymentInsertResult: InsertResult = await manager
      //   .createQueryBuilder()
      //   .insert()
      //   .into(CustomerPayment)
      //   .values(customerPaymentInsert)
      //   // .returning('*')
      //   .execute()

      // const [customerPayment] = CustomerPayment.fromRaws(customerPaymentInsertResult.raw)

      // if (!customerPayment) {
      //   throw new Error(
      //     `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
      //   )
      // }

      return { visitBasic: visit }
    })

    return transaction
  }
}
