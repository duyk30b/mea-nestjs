import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ProductBatchRepository, ProductRepository } from '_libs/database/repository'
import {
	ProductBatchGetManyQuery, ProductBatchGetOneQuery,
	ProductBatchInsertBody, ProductBatchPaginationQuery,
	ProductBatchUpdateBody,
} from './request'

@Injectable()
export class ApiProductBatchService {
	constructor(
		private readonly productBatchRepository: ProductBatchRepository,
		private readonly productRepository: ProductRepository
	) { }

	async pagination(oid: number, query: ProductBatchPaginationQuery) {
		const { page, limit, total, data } = await this.productBatchRepository.pagination({
			page: query.page,
			limit: query.limit,
			condition: {
				oid,
				productId: query.filter?.productId,
				quantityZero: query.filter?.quantityZero,
				isActive: query.filter?.isActive,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relation?.product && data.length) {
			const productIds = uniqueArray(data.map((i) => i.productId))
			const products = await this.productRepository.findMany({ ids: productIds })
			data.forEach((i) => i.product = products.find((j) => j.id === i.productId))
		}

		return { page, limit, total, data }
	}

	async getList(oid: number, query: ProductBatchGetManyQuery) {
		const productBatches = await this.productBatchRepository.find({
			condition: {
				oid,
				productId: query.filter?.productId,
				quantityZero: query.filter?.quantityZero,
				isActive: query.filter?.isActive,
			},
			limit: query.limit,
		})
		if (query.relation?.product && productBatches.length) {
			const products = await this.productRepository.findMany({
				oid,
				ids: uniqueArray(productBatches.map((item) => item.productId)),
			})
			productBatches.forEach((item) => {
				item.product = products.find((pr) => pr.id === item.productId)
			})
		}
		return productBatches
	}

	async getOne(oid: number, id: number, query: ProductBatchGetOneQuery) {
		const productBatch = await this.productBatchRepository.findOne(
			{ oid, id },
			{ product: query.relation?.product }
		)
		return productBatch
	}

	async createOne(oid: number, body: ProductBatchInsertBody) {
		const productBatch = await this.productBatchRepository.insertOne(oid, body)
		return productBatch
	}

	async updateOne(oid: number, id: number, body: ProductBatchUpdateBody) {
		const { affected } = await this.productBatchRepository.update({ id, oid }, body)
		if (affected !== 1) throw new Error('Database.UpdateFailed')

		const productBatch = await this.productBatchRepository.findOne({ id, oid })
		return productBatch
	}

	async deleteOne(oid: number, id: number) {
		await this.productBatchRepository.delete(oid, id)
		return { success: true }
	}
}
