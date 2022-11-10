import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { InvoiceItem } from '_libs/database/entities'
import { DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { InvoiceItemCriteria, InvoiceItemOrder } from './invoice-item.dto'

@Injectable()
export class InvoiceItemRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: InvoiceItemCriteria = {}) {
		const where: FindOptionsWhere<InvoiceItem> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.customerId != null) where.customerId = criteria.customerId
		if (criteria.referenceId != null) where.referenceId = criteria.referenceId
		if (criteria.type != null) where.type = criteria.type

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		return where
	}

	getQueryBuilder(criteria: InvoiceItemCriteria = {}) {
		let query = this.manager.createQueryBuilder(InvoiceItem, 'invoiceItem')
		if (criteria.id != null) {
			query = query.andWhere('invoiceItem.id = :id', { id: criteria.id })
		}
		if (criteria.referenceId != null) {
			query = query.andWhere('invoiceItem.referenceId = :referenceId', { referenceId: criteria.referenceId })
		}
		if (criteria.type != null) {
			query = query.andWhere('invoiceItem.type = :type', { type: criteria.type })
		}
		if (criteria.oid != null) {
			query = query.andWhere('invoiceItem.oid = :oid', { oid: criteria.oid })
		}
		return query
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: InvoiceItemCriteria,
		order?: InvoiceItemOrder
	}) {
		const { limit, page, criteria, order } = options
		const [data, total] = await this.manager.findAndCount(InvoiceItem, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}
}
