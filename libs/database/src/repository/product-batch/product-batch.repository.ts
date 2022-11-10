import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { ProductBatch, ProductMovement } from '_libs/database/entities'
import { DataSource, EntityManager, FindOptionsWhere, In, Not, Raw } from 'typeorm'
import { ProductBatchCriteria, ProductBatchOrder } from './product-batch.dto'

@Injectable()
export class ProductBatchRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	getWhereOptions(criteria: ProductBatchCriteria = {}) {
		const where: FindOptionsWhere<ProductBatch> = {}
		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.productId != null) where.productId = criteria.productId

		if (criteria.quantityZero === false) where.quantity = Not(0)    // không lấy số lượng 0
		if (criteria.overdue === false) {                                    // không lấy quá hạn
			where.expiryDate = Raw((alias) => `(${alias} > :date OR ${alias} IS NULL)`, { date: Date.now() })
		}

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}
		if (criteria.productIds) {
			if (criteria.productIds.length === 0) criteria.productIds.push(0)
			where.productId = In(criteria.productIds)
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: ProductBatchCriteria,
		order?: ProductBatchOrder,
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(ProductBatch, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(criteria: ProductBatchCriteria, relations?: { product?: boolean }): Promise<ProductBatch> {
		const [productBatch] = await this.manager.find(ProductBatch, {
			where: this.getWhereOptions(criteria),
			relations: { product: !!relations?.product },
			relationLoadStrategy: 'join', // dùng join thì bị lỗi 2 câu query, bằng hòa
		})
		return productBatch
	}

	async findMany(criteria: ProductBatchCriteria, relations?: { product?: boolean }): Promise<ProductBatch[]> {
		const productBatches = await this.manager.find(ProductBatch, {
			where: this.getWhereOptions(criteria),
			relations: { product: !!relations?.product },
			relationLoadStrategy: 'join', // dùng join thì bị lỗi 2 câu query, bằng hòa
		})
		return productBatches
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
		criteria: ProductBatchCriteria,
		dto: NoExtraProperties<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity' | 'productId'>>, T>
	) {
		const where = this.getWhereOptions(criteria)
		return await this.manager.update(ProductBatch, where, dto)
	}

	async delete(oid: number, id: number) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const deleteBatch = await manager.delete(ProductBatch, { oid, id, quantity: 0 }) // delete trước để lock bản ghi lại
			if (deleteBatch.affected !== 1) {
				throw new Error(`Delete ProductBatch ${id} failed: Can't delete ProductBatch with quantity !== 0`)
			}
			const number = await manager.count(ProductMovement, { where: { productBatchId: id, oid } })
			if (number) {
				throw new Error(`Delete ProductBatch ${id} failed: Can't delete ProductBatch with exits ProductMovement`)
			}
		})
	}
}
