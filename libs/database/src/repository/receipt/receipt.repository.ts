import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Receipt } from '_libs/database/entities'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { ReceiptCondition, ReceiptOrder } from './receipt.dto'

@Injectable()
export class ReceiptRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(condition: ReceiptCondition = {}) {
		const where: FindOptionsWhere<Receipt> = {}

		if (condition.id != null) where.id = condition.id
		if (condition.oid != null) where.oid = condition.oid
		if (condition.distributorId != null) where.distributorId = condition.distributorId
		if (condition.status != null) where.status = condition.status

		if (condition.ids) {
			if (condition.ids.length === 0) condition.ids.push(0)
			where.id = In(condition.ids)
		}
		if (condition.distributorIds) {
			if (condition.distributorIds.length === 0) condition.distributorIds.push(0)
			where.distributorId = In(condition.distributorIds)
		}
		if (condition.statuses) {
			if (condition.statuses.length === 0) condition.statuses.push(0)
			where.status = In(condition.statuses)
		}

		let paymentTime = undefined
		if (condition.fromTime && condition.toTime) paymentTime = Between(condition.fromTime, condition.toTime)
		else if (condition.fromTime) paymentTime = MoreThanOrEqual(condition.fromTime)
		else if (condition.toTime) paymentTime = LessThanOrEqual(condition.toTime)
		if (paymentTime != null) where.paymentTime = paymentTime

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		condition?: ReceiptCondition,
		order?: ReceiptOrder
	}) {
		const { limit, page, condition, order } = options

		const [data, total] = await this.manager.findAndCount(Receipt, {
			where: this.getWhereOptions(condition),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findMany(condition: ReceiptCondition, relation?: { distributor?: boolean, receiptItems?: boolean }): Promise<Receipt[]> {
		const receipts = await this.manager.find(Receipt, {
			where: this.getWhereOptions(condition),
			relations: {
				distributor: !!relation?.distributor,
				receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
			},
			relationLoadStrategy: 'join',
		})
		return receipts
	}

	async findOne(condition: ReceiptCondition, relation?: { distributor?: boolean, receiptItems?: boolean }): Promise<Receipt> {
		const [receipt] = await this.manager.find(Receipt, {
			where: this.getWhereOptions(condition),
			relations: {
				distributor: !!relation?.distributor,
				receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
			},
			relationLoadStrategy: 'join',
		})
		return receipt
	}

	async queryOneBy(condition: { id: number, oid: number }, relation?: {
		distributor?: boolean,
		receiptItems?: { productBatch?: boolean }
	}): Promise<Receipt> {
		let query = this.manager.createQueryBuilder(Receipt, 'receipt')
			.where('receipt.id = :id', { id: condition.id })
			.andWhere('receipt.oid = :oid', { oid: condition.oid })

		if (relation?.distributor) query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
		if (relation?.receiptItems) query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem')
		if (relation?.receiptItems?.productBatch) {
			query = query
				.leftJoinAndSelect('receiptItem.productBatch', 'productBatch')
				.leftJoinAndSelect('productBatch.product', 'product')
		}

		const receipt = await query.getOne()
		return receipt
	}
}
