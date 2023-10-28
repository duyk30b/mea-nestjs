import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { ProductMovementType } from '_libs/database/common/variable'
import { ProductMovement } from '_libs/database/entities'
import { EntityManager, FindOptionsWhere } from 'typeorm'
import { ProductMovementCondition, ProductMovementOrder } from './product-movement.dto'

@Injectable()
export class ProductMovementRepository {
	constructor(@InjectEntityManager() private manager: EntityManager) { }

	getWhereOptions(condition: ProductMovementCondition = {}) {
		const where: FindOptionsWhere<ProductMovement> = {}
		if (condition.oid != null) where.oid = condition.oid
		if (condition.productId != null) where.productId = condition.productId
		if (condition.productBatchId != null) where.productBatchId = condition.productBatchId

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		condition?: ProductMovementCondition,
		order?: ProductMovementOrder,
	}) {
		const { limit, page, condition, order } = options

		const [data, total] = await this.manager.findAndCount(ProductMovement, {
			where: this.getWhereOptions(condition),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async queryOne(
		condition?: { oid: number, productId?: number, productBatchId?: number, },
		relation?: {
			productBatch?: { product?: boolean },
			invoice?: { customer?: boolean },
			receipt?: { distributor?: boolean }
		}
	) {
		let query = this.manager.createQueryBuilder(ProductMovement, 'productMovement')
			.where('productMovement.oid = :oid', { oid: condition.oid })

		if (condition?.productId) {
			query = query.andWhere('productMovement.productId = :productId', { productId: condition.productId })
		}
		if (condition?.productBatchId) {
			query = query.andWhere(
				'productMovement.productBatchId = :productBatchId',
				{ productBatchId: condition.productBatchId }
			)
		}

		if (relation?.invoice) {
			query = query.leftJoinAndSelect(
				'productMovement.invoice',
				'invoice',
				'productMovement.type = :typeInvoice',
				{ typeInvoice: ProductMovementType.Invoice }
			)
		}
		if (relation?.invoice?.customer) {
			query = query.leftJoinAndSelect('invoice.customer', 'customer')
		}

		if (relation?.receipt) {
			query = query.leftJoinAndSelect(
				'productMovement.receipt',
				'receipt',
				'productMovement.type = :typeReceipt',
				{ typeReceipt: ProductMovementType.Receipt }
			)
		}
		if (relation?.receipt?.distributor) {
			query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
		}

		const productBatch = await query.getOne()
		return productBatch
	}
}
