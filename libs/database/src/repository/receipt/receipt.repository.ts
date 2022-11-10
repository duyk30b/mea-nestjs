import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Receipt } from '_libs/database/entities'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { ReceiptCriteria, ReceiptOrder } from './receipt.dto'

@Injectable()
export class ReceiptRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: ReceiptCriteria = {}) {
		const where: FindOptionsWhere<Receipt> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.distributorId != null) where.distributorId = criteria.distributorId
		if (criteria.purchaseId != null) where.purchaseId = criteria.purchaseId
		if (criteria.paymentStatus != null) where.paymentStatus = criteria.paymentStatus

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}
		if (criteria.distributorIds) {
			if (criteria.distributorIds.length === 0) criteria.distributorIds.push(0)
			where.distributorId = In(criteria.distributorIds)
		}
		if (criteria.purchaseIds) {
			if (criteria.purchaseIds.length === 0) criteria.purchaseIds.push(0)
			where.purchaseId = In(criteria.purchaseIds)
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
		criteria?: ReceiptCriteria,
		order?: ReceiptOrder
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(Receipt, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findMany(criteria: ReceiptCriteria, relations?: { distributor?: boolean, receiptItems?: boolean }): Promise<Receipt[]> {
		const receipts = await this.manager.find(Receipt, {
			where: this.getWhereOptions(criteria),
			relations: {
				distributor: !!relations?.distributor,
				receiptItems: relations.receiptItems ? { productBatch: { product: true } } : false,
			},
			relationLoadStrategy: 'join',
		})
		return receipts
	}

	async findOne(criteria: ReceiptCriteria, relations?: { distributor?: boolean, receiptItems?: boolean }): Promise<Receipt> {
		const [receipt] = await this.manager.find(Receipt, {
			where: this.getWhereOptions(criteria),
			relations: {
				distributor: !!relations?.distributor,
				receiptItems: relations.receiptItems ? { productBatch: { product: true } } : false,
			},
			relationLoadStrategy: 'join',
		})
		return receipt
	}

	async queryOneBy(criteria: { id: number, oid: number }, relations?: {
		distributor?: boolean,
		receiptItems?: { productBatch?: boolean }
	}): Promise<Receipt> {
		let query = this.manager.createQueryBuilder(Receipt, 'receipt')
			.where('receipt.id = :id', { id: criteria.id })
			.andWhere('receipt.oid = :oid', { oid: criteria.oid })

		if (relations?.distributor) query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
		if (relations?.receiptItems) query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem')
		if (relations?.receiptItems?.productBatch) {
			query = query
				.leftJoinAndSelect('receiptItem.productBatch', 'productBatch')
				.leftJoinAndSelect('productBatch.product', 'product')
		}

		const receipt = await query.getOne()
		return receipt
	}
}
