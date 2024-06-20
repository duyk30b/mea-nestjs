import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, Raw, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PaymentType, VoucherType } from '../../common/variable'
import { Customer, CustomerPayment, Visit } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitPayDebt {
  constructor(private dataSource: DataSource) {}

  async payDebt(params: { oid: number; visitId: number; time: number; money: number }) {
    const { oid, visitId, time, money } = params
    const PREFIX = `visitId=${visitId} pay debt failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. INVOICE: update ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        debt: Raw((alias) => `${alias} - :money >= 0`, { money }),
        visitStatus: VisitStatus.Debt,
      }
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        visitStatus: () => `CASE 
                              WHEN("debt" = ${money}) THEN ${VisitStatus.Completed} 
                              ELSE ${VisitStatus.Debt}
                              END
                          `,
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

      // === 2. UPDATE CUSTOMER ===
      const whereCustomer: FindOptionsWhere<Customer> = { oid, id: visit.customerId }
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
        throw new Error(`${PREFIX}: customerId=${visit.customerId} update failed`)
      }
      const customer = Customer.fromRaw(customerUpdateResult.raw[0])

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + money

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentDraft: CustomerPaymentInsertType = {
        oid,
        customerId: visit.customerId,
        voucherId: visitId,
        voucherType: VoucherType.Visit,
        createdAt: time,
        paymentType: PaymentType.PayDebt,
        paid: money,
        debit: -money, //
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }
      const customerPaymentInsertResult = await manager.insert(
        CustomerPayment,
        customerPaymentDraft
      )
      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `${PREFIX}: Insert CustomerPayment failed: ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      return { visitBasic: visit, customer }
    })

    return transaction
  }
}
