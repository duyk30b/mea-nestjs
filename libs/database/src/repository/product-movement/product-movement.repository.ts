import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { ProductMovementType } from '_libs/database/common/variable'
import { ProductMovement } from '_libs/database/entities'
import { EntityManager, FindOptionsWhere } from 'typeorm'
import { ProductMovementCriteria, ProductMovementOrder } from './product-movement.dto'

@Injectable()
export class ProductMovementRepository {
	constructor(@InjectEntityManager() private manager: EntityManager) { }

	getWhereOptions(criteria: ProductMovementCriteria = {}) {
		const where: FindOptionsWhere<ProductMovement> = {}
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.productId != null) where.productId = criteria.productId
		if (criteria.productBatchId != null) where.productBatchId = criteria.productBatchId

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: ProductMovementCriteria,
		order?: ProductMovementOrder,
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(ProductMovement, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async queryOne(
		criteria?: { oid: number, productId?: number, productBatchId?: number, },
		relations?: {
			productBatch?: { product?: boolean },
			invoice?: { customer?: boolean },
			receipt?: { distributor?: boolean }
		}
	) {
		let query = this.manager.createQueryBuilder(ProductMovement, 'productMovement')
			.where('productMovement.oid = :oid', { oid: criteria.oid })

		if (criteria?.productId) {
			query = query.andWhere('productMovement.productId = :productId', { productId: criteria.productId })
		}
		if (criteria?.productBatchId) {
			query = query.andWhere(
				'productMovement.productBatchId = :productBatchId',
				{ productBatchId: criteria.productBatchId }
			)
		}

		if (relations?.invoice) {
			query = query.leftJoinAndSelect(
				'productMovement.invoice',
				'invoice',
				'productMovement.type = :typeInvoice',
				{ typeInvoice: ProductMovementType.Invoice }
			)
		}
		if (relations?.invoice?.customer) {
			query = query.leftJoinAndSelect('invoice.customer', 'customer')
		}

		if (relations?.receipt) {
			query = query.leftJoinAndSelect(
				'productMovement.receipt',
				'receipt',
				'productMovement.type = :typeReceipt',
				{ typeReceipt: ProductMovementType.Receipt }
			)
		}
		if (relations?.receipt?.distributor) {
			query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
		}

		const productBatch = await query.getOne()
		return productBatch
	}
}
