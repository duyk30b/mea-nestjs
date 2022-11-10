import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { InvoiceItemType } from '_libs/database/common/variable'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThan, MoreThanOrEqual } from 'typeorm'
import { Arrival } from '../../entities'
import { ArrivalCriteria, ArrivalOrder } from './arrival.dto'

@Injectable()
export class ArrivalRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: ArrivalCriteria = {}) {
		const where: FindOptionsWhere<Arrival> = {}
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.id != null) where.id = criteria.id
		if (criteria.customerId != null) where.customerId = criteria.customerId
		if (criteria.type != null) where.type = criteria.type
		if (criteria.paymentStatus != null) where.paymentStatus = criteria.paymentStatus

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}
		if (criteria.types) where.type = In(criteria.types)

		let createTime = undefined
		if (criteria.fromTime && criteria.toTime) createTime = Between(criteria.fromTime, criteria.toTime)
		else if (criteria.fromTime) createTime = MoreThanOrEqual(criteria.fromTime)
		else if (criteria.toTime) createTime = LessThan(criteria.toTime)
		if (createTime != null) where.createTime = createTime

		return where
	}

	async pagination(options: { page: number, limit: number, criteria?: ArrivalCriteria, order?: ArrivalOrder }) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(Arrival, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(criteria: { id: number, oid: number }, relations?: {
		customer?: boolean,
		invoices?: { invoiceItems?: { procedure?: boolean, productBatch?: boolean } }
	}): Promise<Arrival> {
		let query = this.manager.createQueryBuilder(Arrival, 'arrival')
		if (relations?.customer) query = query.leftJoinAndSelect('arrival.customer', 'customer')
		if (relations?.invoices) query = query.leftJoinAndSelect('arrival.invoices', 'invoice')
		if (relations?.invoices?.invoiceItems) query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
		if (relations?.invoices?.invoiceItems?.procedure) query = query.leftJoinAndSelect(
			'invoiceItem.procedure',
			'procedure',
			'invoiceItem.type = :typeProcedure',
			{ typeProcedure: InvoiceItemType.Procedure }
		)
		if (relations?.invoices?.invoiceItems?.productBatch) {
			query = query
				.leftJoinAndSelect(
					'invoiceItem.productBatch',
					'productBatch',
					'invoiceItem.type = :typeProductBatch',
					{ typeProductBatch: InvoiceItemType.ProductBatch }
				)
				.leftJoinAndSelect('productBatch.product', 'product')
		}

		query = query.where('arrival.id = :id', { id: criteria.id })
			.andWhere('arrival.oid = :oid', { oid: criteria.oid })

		const arrival = await query.getOne()
		return arrival
	}
}
