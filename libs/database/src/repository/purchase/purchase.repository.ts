import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Purchase } from '_libs/database/entities'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThan, MoreThanOrEqual } from 'typeorm'
import { PurchaseCriteria, PurchaseOrder } from './purchase.dto'

@Injectable()
export class PurchaseRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: PurchaseCriteria = {}) {
		const where: FindOptionsWhere<Purchase> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.distributorId != null) where.distributorId = criteria.distributorId
		if (criteria.paymentStatus != null) where.paymentStatus = criteria.paymentStatus

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}
		if (criteria.distributorIds) {
			if (criteria.distributorIds.length === 0) criteria.distributorIds.push(0)
			where.distributorId = In(criteria.distributorIds)
		}

		let createTime = undefined
		if (criteria.fromTime && criteria.toTime) createTime = Between(criteria.fromTime, criteria.toTime)
		else if (criteria.fromTime) createTime = MoreThanOrEqual(criteria.fromTime)
		else if (criteria.toTime) createTime = LessThan(criteria.toTime)
		if (createTime != null) where.createTime = createTime

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: PurchaseCriteria,
		order?: PurchaseOrder,
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(Purchase, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(criteria: PurchaseCriteria, relations?: { distributor?: boolean, receipts?: boolean }): Promise<Purchase> {
		const [purchase] = await this.manager.find(Purchase, {
			where: this.getWhereOptions(criteria),
			relations: {
				distributor: !!relations?.distributor,
				receipts: relations.receipts ? { receiptItems: { productBatch: { product: true } } } : false,
			},
			relationLoadStrategy: 'join',
		})
		return purchase
	}
}
