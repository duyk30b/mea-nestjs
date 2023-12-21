import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { InvoiceItem } from '../../entities'
import { InvoiceItemCondition, InvoiceItemOrder } from './invoice-item.dto'

@Injectable()
export class InvoiceItemRepository {
    constructor(
        private dataSource: DataSource,
        @InjectEntityManager() private manager: EntityManager
    ) {}

    getWhereOptions(condition: InvoiceItemCondition = {}) {
        const where: FindOptionsWhere<InvoiceItem> = {}

        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.customerId != null) where.customerId = condition.customerId
        if (condition.referenceId != null) where.referenceId = condition.referenceId
        if (condition.type != null) where.type = condition.type

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        return where
    }

    getQueryBuilder(condition: InvoiceItemCondition = {}) {
        let query = this.manager.createQueryBuilder(InvoiceItem, 'invoiceItem')
        if (condition.id != null) {
            query = query.andWhere('invoiceItem.id = :id', { id: condition.id })
        }
        if (condition.referenceId != null) {
            query = query.andWhere('invoiceItem.referenceId = :referenceId', {
                referenceId: condition.referenceId,
            })
        }
        if (condition.type != null) {
            query = query.andWhere('invoiceItem.type = :type', { type: condition.type })
        }
        if (condition.oid != null) {
            query = query.andWhere('invoiceItem.oid = :oid', { oid: condition.oid })
        }
        return query
    }

    async pagination(options: {
        page: number
        limit: number
        condition?: InvoiceItemCondition
        order?: InvoiceItemOrder
    }) {
        const { limit, page, condition, order } = options
        const [data, total] = await this.manager.findAndCount(InvoiceItem, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }
}
