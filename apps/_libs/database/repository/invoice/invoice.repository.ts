import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { ConditionType } from 'apps/_libs/common/dto/base-condition'
import { EntityManager, Repository } from 'typeorm'
import { InvoiceItemType } from '../../common/variable'
import { Invoice } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class InvoiceRepository extends BaseSqlRepository<
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
            invoiceItems?: { procedure?: boolean; productBatch?: { product?: boolean } }
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
        }
        if (relation?.invoiceItems?.procedure) {
            query = query.leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', {
                typeProcedure: InvoiceItemType.Procedure,
            })
        }
        if (relation?.invoiceItems?.productBatch) {
            query = query.leftJoinAndSelect(
                'invoiceItem.productBatch',
                'productBatch',
                'invoiceItem.type = :typeProductBatch',
                { typeProductBatch: InvoiceItemType.ProductBatch }
            )
        }
        if (relation?.invoiceItems?.productBatch?.product) {
            query = query.leftJoinAndSelect('productBatch.product', 'product')
        }

        const invoice = await query.getOne()
        return invoice
    }

    async sumDebt(condition: ConditionType<Invoice>): Promise<number> {
        const where = this.getWhereOptions(condition)
        const { sum } = await this.manager
            .createQueryBuilder(Invoice, 'invoice')
            .select('SUM(debt)', 'sum')
            .where(where)
            .getRawOne()
        return sum
    }
}
