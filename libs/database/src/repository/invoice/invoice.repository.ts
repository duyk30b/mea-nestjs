import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { InvoiceItemType } from '_libs/database/common/variable'
import { Invoice } from '_libs/database/entities'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { InvoiceCriteria, InvoiceOrder } from './invoice.dto'

@Injectable()
export class InvoiceRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: InvoiceCriteria = {}) {
		const where: FindOptionsWhere<Invoice> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.customerId != null) where.customerId = criteria.customerId
		if (criteria.arrivalId != null) where.arrivalId = criteria.arrivalId
		if (criteria.paymentStatus != null) where.paymentStatus = criteria.paymentStatus

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}
		if (criteria.customerIds) {
			if (criteria.customerIds.length === 0) criteria.customerIds.push(0)
			where.customerId = In(criteria.customerIds)
		}
		if (criteria.arrivalIds) {
			if (criteria.arrivalIds.length === 0) criteria.arrivalIds.push(0)
			where.arrivalId = In(criteria.arrivalIds)
		}
		if (criteria.paymentStatuses) {
			if (criteria.paymentStatuses.length === 0) criteria.paymentStatuses.push(0)
			where.paymentStatus = In(criteria.paymentStatuses)
		}

		let paymentTime = undefined
		if (criteria.fromTime && criteria.toTime) paymentTime = Between(criteria.fromTime, criteria.toTime)
		else if (criteria.fromTime) paymentTime = MoreThanOrEqual(criteria.fromTime)
		else if (criteria.toTime) paymentTime = LessThanOrEqual(criteria.toTime)
		if (paymentTime != null) where.paymentTime = paymentTime

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: InvoiceCriteria,
		relations?: { customer?: boolean },
		order?: InvoiceOrder
	}) {
		const { limit, page, criteria, relations, order } = options

		const [data, total] = await this.manager.findAndCount(Invoice, {
			relations: { customer: !!relations?.customer },
			relationLoadStrategy: 'query', // dùng join thì bị lỗi 2 câu query, bằng hòa
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(criteria: InvoiceCriteria, relations?: { customer: boolean }): Promise<Invoice> {
		const [invoice] = await this.manager.find(Invoice, {
			where: this.getWhereOptions(criteria),
			relations: { customer: !!relations?.customer },
			relationLoadStrategy: 'join',
		})
		return invoice
	}

	async findMany(criteria: InvoiceCriteria, relations?: { customer: boolean }): Promise<Invoice[]> {
		const invoices = await this.manager.find(Invoice, {
			where: this.getWhereOptions(criteria),
			relations: { customer: !!relations?.customer },
			relationLoadStrategy: 'join',
		})
		return invoices
	}

	async queryOneBy(criteria: { id: number, oid: number }, relations?: {
		customer?: boolean,
		invoiceItems?: { procedure?: boolean, productBatch?: { product?: boolean } }
	}): Promise<Invoice> {
		let query = this.manager.createQueryBuilder(Invoice, 'invoice')
			.where('invoice.id = :id', { id: criteria.id })
			.andWhere('invoice.oid = :oid', { oid: criteria.oid })

		if (relations?.customer) query = query.leftJoinAndSelect('invoice.customer', 'customer')
		if (relations?.invoiceItems) query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
		if (relations?.invoiceItems?.procedure) query = query.leftJoinAndSelect(
			'invoiceItem.procedure',
			'procedure',
			'invoiceItem.type = :typeProcedure',
			{ typeProcedure: InvoiceItemType.Procedure }
		)
		if (relations?.invoiceItems?.productBatch) {
			query = query.leftJoinAndSelect(
				'invoiceItem.productBatch',
				'productBatch',
				'invoiceItem.type = :typeProductBatch',
				{ typeProductBatch: InvoiceItemType.ProductBatch }
			)
		}
		if (relations?.invoiceItems?.productBatch?.product) {
			query = query.leftJoinAndSelect('productBatch.product', 'product')
		}

		const invoice = await query.getOne()
		return invoice
	}
}
