import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ProductBatchRepository, ProductRepository } from '_libs/database/repository'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { ProductCreateBody, ProductGetManyQuery, ProductGetOneQuery, ProductPaginationQuery, ProductUpdateBody } from './request'

@Injectable()
export class ApiProductService {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly productBatchRepository: ProductBatchRepository
	) { }

	async pagination(oid: number, query: ProductPaginationQuery) {
		const { page, limit, total, data } = await this.productRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				group: query.filter?.group,
				isActive: query.filter?.isActive,
				searchText: query.filter?.searchText,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relations?.productBatches && data.length) {
			const productIds = uniqueArray(data.map((item) => item.id))
			const productBatches = await this.productBatchRepository.findMany({ productIds, quantityZero: false })
			data.forEach((item) => item.productBatches = productBatches
				.filter((ma) => ma.productId === item.id)
				.sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
		}

		return { total, page, limit, data }
	}

	async getList(oid: number, query: ProductGetManyQuery) {
		const products = await this.productRepository.find({
			criteria: {
				oid,
				isActive: query.filter?.isActive,
				group: query.filter?.group,
				searchText: query.filter?.searchText,
			},
			limit: query.limit,
		})
		if (query.relations?.productBatches && products.length) {
			const productBatches = await this.productBatchRepository.findMany({
				productIds: uniqueArray(products.map((item) => item.id)),
				quantityZero: query.filter.quantityZero,          // có lấy số lượng 0
				overdue: query.filter.overdue,                    // không lấy quá hạn
			})
			products.forEach((item) => item.productBatches = productBatches
				.filter((ma) => ma.productId === item.id)
				.sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
		}
		return products
	}

	async getOne(oid: number, id: number, query: ProductGetOneQuery) {
		const product = await this.productRepository.findOne({ oid, id })
		if (query.relations?.productBatches) {
			const batches = await this.productBatchRepository.findMany({
				oid,
				productId: product.id,
				quantityZero: false,
			})
			product.productBatches = batches.sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1)
		}
		return product
	}

	async createOne(oid: number, body: ProductCreateBody) {
		return await this.productRepository.insertOne(oid, body)
	}

	async updateOne(oid: number, id: number, body: ProductUpdateBody) {
		const { affected } = await this.productRepository.update({ id, oid }, body)
		if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)
		return await this.productRepository.findOne({ id })
	}
}
