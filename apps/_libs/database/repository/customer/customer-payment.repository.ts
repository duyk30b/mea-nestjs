import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import { InvoiceStatus, PaymentType } from '../../common/variable'
import { Customer, CustomerPayment, Invoice } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class CustomerPaymentRepository extends PostgreSqlRepository<
  CustomerPayment,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'customer']?: boolean }
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
    invoicePayments?: { invoiceId: number; money: number }[]
    note?: string
  }) {
    const { oid, customerId, invoicePayments, time, note } = options
    if (!invoicePayments.length || invoicePayments.some((item) => (item.money || 0) <= 0)) {
      throw new Error(`Customer ${customerId} pay debt failed: Money number invalid`)
    }

    const invoiceIds = invoicePayments.map((i) => i.invoiceId)
    const totalMoney = invoicePayments.reduce((acc, cur) => acc + cur.money, 0)

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Update customer trước để lock
      const updateCustomerResult = await manager.decrement<Customer>(
        Customer,
        {
          id: customerId,
          oid,
          debt: MoreThanOrEqual(totalMoney),
        },
        'debt',
        totalMoney
      )
      if (updateCustomerResult.affected !== 1) {
        throw new Error(`Customer ${customerId} pay debt failed: Update customer invalid`)
      }

      const customer = await manager.findOne(Customer, { where: { oid, id: customerId } })
      let customerOpenDebt = customer.debt + totalMoney
      const customerPaymentListDto: CustomerPaymentInsertType[] = []

      for (let i = 0; i < invoiceIds.length; i++) {
        const invoiceId = invoiceIds[i] || 0
        const money = invoicePayments.find((item) => item.invoiceId === invoiceId)?.money

        // Trả nợ vào từng đơn
        const invoiceUpdateResult = await manager
          .createQueryBuilder()
          .update(Invoice)
          .set({
            status: () => `CASE 
                            WHEN(debt = ${money}) THEN ${InvoiceStatus.Success} 
                            ELSE ${InvoiceStatus.Debt}
                            END
                        `,
            debt: () => `debt - ${money}`,
            paid: () => `paid + ${money}`,
          })
          .where({
            oid,
            id: invoiceId,
            customerId,
            status: InvoiceStatus.Debt,
            debt: MoreThanOrEqual(money),
          })
          .execute()
        if (invoiceUpdateResult.affected !== 1) {
          throw new Error(
            `Customer ${customerId} pay debt failed: Update Invoice ${invoiceId} failed`
          )
        }
        const invoice = await manager.findOne(Invoice, { where: { oid, id: invoiceId } })
        const invoiceOpenDebt = invoice.debt + money

        const customerPaymentDto: CustomerPaymentInsertType = {
          oid,
          customerId,
          invoiceId,
          createdAt: time,
          type: PaymentType.PayDebt,
          paid: money,
          debit: -money,
          customerOpenDebt,
          customerCloseDebt: customerOpenDebt - money,
          invoiceOpenDebt,
          invoiceCloseDebt: invoiceOpenDebt - money,
          note,
          description:
            invoicePayments.length > 1
              ? `Trả ${formatNumber(totalMoney)} vào ${invoicePayments.length} đơn nợ: ` +
                `${JSON.stringify(invoiceIds)}`
              : undefined,
        }
        customerOpenDebt = customerOpenDebt - money
        customerPaymentListDto.push(customerPaymentDto)
      }

      await this.customerPaymentRepository.insert(customerPaymentListDto)

      return { customerId }
    })
  }
}
