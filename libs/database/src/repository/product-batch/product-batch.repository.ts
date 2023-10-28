import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { ProductBatch, ProductMovement } from '_libs/database/entities'
import { DataSource, EntityManager, FindOptionsWhere, In, Not, Raw } from 'typeorm'
import { ProductBatchCondition, ProductBatchOrder } from './product-batch.dto'

@Injectable()
export class ProductBatchRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(condition: ProductBatchCondition = {}) {
		const where: FindOptionsWhere<ProductBatch> = {}
		if (condition.id != null) where.id = condition.id
		if (condition.oid != null) where.oid = condition.oid
		if (condition.productId != null) where.productId = condition.productId
		if (condition.isActive != null) where.isActive = condition.isActive

		if (condition.quantityZero === false) where.quantity = Not(0)    // không lấy số lượng 0
		if (condition.overdue === false) {                                    // không lấy quá hạn
			where.expiryDate = Raw((alias) => `(${alias} > :date OR ${alias} IS NULL)`, { date: Date.now() })
		}

		if (condition.ids) {
			if (condition.ids.length === 0) condition.ids.push(0)
			where.id = In(condition.ids)
		}
		if (condition.productIds) {
			if (condition.productIds.length === 0) condition.productIds.push(0)
			where.productId = In(condition.productIds)
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		condition?: ProductBatchCondition,
		order?: ProductBatchOrder,
	}) {
		const { limit, page, condition, order } = options

		const [data, total] = await this.manager.findAndCount(ProductBatch, {
			where: this.getWhereOptions(condition),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async find(options: { limit?: number, condition?: ProductBatchCondition, order?: ProductBatchOrder }): Promise<ProductBatch[]> {
		const { limit, condition, order } = options

		return await this.manager.find(ProductBatch, {
			where: this.getWhereOptions(condition),
			order,
			take: limit,
		})
	}

	async findMany(condition: ProductBatchCondition, relation?: { product?: boolean }): Promise<ProductBatch[]> {
		const productBatches = await this.manager.find(ProductBatch, {
			where: this.getWhereOptions(condition),
			relations: { product: !!relation?.product },
			relationLoadStrategy: 'join', // dùng join thì bị lỗi 2 câu query, bằng hòa
		})
		return productBatches
	}

	async findOne(condition: ProductBatchCondition, relation?: { product?: boolean }): Promise<ProductBatch> {
		const [productBatch] = await this.manager.find(ProductBatch, {
			where: this.getWhereOptions(condition),
			relations: { product: !!relation?.product },
			relationLoadStrategy: 'join', // dùng join thì bị lỗi 2 câu query, bằng hòa
		})
		return productBatch
	}

	async insertOne<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>> & { productId: number }>(
		oid: number,
		dto: NoExtraProperties<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>, T>
	): Promise<ProductBatch> {
		const batchEntity = this.manager.create<ProductBatch>(ProductBatch, dto)
		batchEntity.oid = oid
		return this.manager.save(batchEntity, { transaction: false })
	}

	async update<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>>(
		condition: ProductBatchCondition,
		dto: NoExtraProperties<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity' | 'productId'>>, T>
	) {
		const where = this.getWhereOptions(condition)
		return await this.manager.update(ProductBatch, where, dto)
	}

	async delete(oid: number, id: number) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const deleteBatch = await manager.delete(ProductBatch, { oid, id, quantity: 0 }) // delete trước để lock bản ghi lại
			if (deleteBatch.affected !== 1) {
				throw new Error('Chỉ có thể xóa lô hàng có số lượng = 0')
			}
			const number = await manager.count(ProductMovement, { where: { productBatchId: id, oid } })
			if (number) {
				throw new Error('Không thể xóa lô hàng đã có dữ liệu nhập xuất')
			}
		})
	}
}
