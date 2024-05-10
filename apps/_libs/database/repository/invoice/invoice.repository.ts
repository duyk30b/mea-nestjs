import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { Invoice } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class InvoiceRepository extends PostgreSqlRepository<
  Invoice,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'customer']?: boolean }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>
  ) {
    super(invoiceRepository)
  }

  async queryOne(
    condition: { id: number; oid: number },
    relation?: {
      customer?: boolean
      customerPayments?: boolean
      invoiceExpenses?: boolean
      invoiceSurcharges?: boolean
      invoiceItems?: { procedure?: boolean; batch?: boolean; product?: boolean } | false
    }
  ): Promise<Invoice> {
    let query = this.manager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.id = :id', { id: condition.id })
      .andWhere('invoice.oid = :oid', { oid: condition.oid })

    if (relation?.customer) query = query.leftJoinAndSelect('invoice.customer', 'customer')
    if (relation?.customerPayments) {
      query = query.leftJoinAndSelect('invoice.customerPayments', 'customerPayment')
    }
    if (relation?.invoiceExpenses) {
      query = query.leftJoinAndSelect('invoice.invoiceExpenses', 'invoiceExpense')
    }
    if (relation?.invoiceSurcharges) {
      query = query.leftJoinAndSelect('invoice.invoiceSurcharges', 'invoiceSurcharge')
    }
    if (relation?.invoiceItems) {
      query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
      if (relation?.invoiceItems?.procedure) {
        query = query.leftJoinAndSelect(
          'invoiceItem.procedure',
          'procedure',
          'invoiceItem.procedureId != 0'
        )
      }
      if (relation?.invoiceItems?.batch) {
        query = query.leftJoinAndSelect('invoiceItem.batch', 'batch', 'invoiceItem.batchId != 0')
      }

      if (relation?.invoiceItems.product) {
        query = query.leftJoinAndSelect(
          'invoiceItem.product',
          'product',
          'invoiceItem.productId != 0'
        )
      }
    }

    const invoice = await query.getOne()
    return invoice
  }

  async sumInvoiceDebt(condition: BaseCondition<Invoice>): Promise<number> {
    const where = this.getWhereOptions(condition)
    const { sum } = await this.manager
      .createQueryBuilder(Invoice, 'invoice')
      .select('SUM(debt)', 'sum')
      .where(where)
      .getRawOne()
    return sum
  }
}
