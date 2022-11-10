import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { escapeSearch } from '_libs/database/common/base.dto'
import { EntityManager, FindOptionsWhere, In, Raw } from 'typeorm'
import { Product } from '../../entities'
import { ProductCriteria, ProductOrder } from './product.dto'

@Injectable()
export class ProductRepository {
	constructor(@InjectEntityManager() private manager: EntityManager) { }

	getWhereOptions(criteria: ProductCriteria = {}) {
		const where: FindOptionsWhere<Product> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.group != null) where.group = criteria.group
		if (criteria.isActive != null) where.isActive = criteria.isActive

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		if (criteria.searchText) {
			const searchText = `%${escapeSearch(convertViToEn(criteria.searchText))}%`                                   // không lấy quá hạn
			where.brandName = Raw(
				(alias) => '(brand_name LIKE :searchText OR substance LIKE :searchText)',
				{ searchText }
			)
		}

		return where
	}

	async pagination(options: { page: number, limit: number, criteria?: ProductCriteria, order?: ProductOrder }) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.manager.findAndCount(Product, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async find(options: { limit?: number, criteria?: ProductCriteria, order?: ProductOrder }): Promise<Product[]> {
		const { limit, criteria, order } = options

		return await this.manager.find(Product, {
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
		})
	}

	async findMany(criteria: ProductCriteria): Promise<Product[]> {
		const where = this.getWhereOptions(criteria)
		return await this.manager.find(Product, { where })
	}

	async findOne(criteria: ProductCriteria): Promise<Product> {
		const where = this.getWhereOptions(criteria)
		const [product] = await this.manager.find(Product, { where })
		return product
	}

	async insertOne<T extends Partial<Product>>(
		oid: number,
		dto: NoExtraProperties<Partial<Product>, T>
	): Promise<Product> {
		const productEntity = this.manager.create<Product>(Product, dto)
		productEntity.oid = oid
		return this.manager.save(productEntity, { transaction: false })
	}

	async update<T extends Partial<Product>>(
		criteria: ProductCriteria,
		dto: NoExtraProperties<Partial<Omit<Product, 'id' | 'oid'>>, T>
	) {
		const where = this.getWhereOptions(criteria)
		return await this.manager.update(Product, where, dto)
	}
}
