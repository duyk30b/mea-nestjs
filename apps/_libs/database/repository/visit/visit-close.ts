import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, MoreThanOrEqual, UpdateResult } from 'typeorm'
import { DTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PaymentType, VoucherType } from '../../common/variable'
import { Customer, CustomerPayment, Visit } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitClose {
  constructor(private dataSource: DataSource) {}

  async close(params: { oid: number; visitId: number; time: number }) {
    const { oid, visitId, time } = params
    const PREFIX = `visitId=${visitId} close failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. INVOICE: update ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: VisitStatus.InProgress,
        debt: MoreThanOrEqual(0),
      }
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        visitStatus: () => `CASE 
                              WHEN("debt" > 0) THEN ${VisitStatus.Debt} 
                              ELSE ${VisitStatus.Completed} 
                            END
                          `,
        profit: () => `"totalMoney" - "totalCostAmount"`,
        endedAt: time,
        year: DTimer.info(time, 7).year,
        month: DTimer.info(time, 7).month + 1,
        date: DTimer.info(time, 7).date,
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
      if (!visit.isSent && visit.productsMoney > 0) {
        throw new Error(`${PREFIX}: Chưa xuất thuốc`)
      }

      let customer: Customer
      if (visit.debt > 0) {
        // === 2. UPDATE CUSTOMER ===
        const whereCustomer: FindOptionsWhere<Customer> = { oid, id: visit.customerId }
        const customerUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Customer)
          .where(whereCustomer)
          .set({
            debt: () => `debt + ${visit.debt}`,
          })
          .returning('*')
          .execute()
        if (customerUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: customerId=${visit.customerId} update failed`)
        }
        customer = Customer.fromRaw(customerUpdateResult.raw[0])

        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt - visit.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const customerPaymentDraft: CustomerPaymentInsertType = {
          oid,
          customerId: visit.customerId,
          voucherId: visitId,
          voucherType: VoucherType.Visit,
          createdAt: time,
          paymentType: PaymentType.Close,
          paid: 0,
          debit: visit.debt,
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
            `${PREFIX}: Insert CustomerPayment failed:` +
              ` ${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
      }
      return { visitBasic: visit, customer }
    })

    return transaction
  }
}
