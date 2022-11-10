import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ProductBatchRepository, ProductRepository } from '_libs/database/repository'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { ProductBatchGetOneQuery, ProductBatchInsertBody, ProductBatchPaginationQuery, ProductBatchUpdateBody } from './request'

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
			criteria: {
				oid,
				productId: query.filter?.productId,
				quantityZero: query.filter?.quantityZero,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relations?.product && data.length) {
			const productIds = uniqueArray(data.map((i) => i.productId))
			const products = await this.productRepository.findMany({ ids: productIds })
			data.forEach((i) => i.product = products.find((j) => j.id === i.productId))
		}

		return { page, limit, total, data }
	}

	async getOne(oid: number, id: number, query: ProductBatchGetOneQuery) {
		const productBatch = await this.productBatchRepository.findOne(
			{ oid, id },
			{ product: query.relations?.product }
		)
		return productBatch
	}

	async createOne(oid: number, body: ProductBatchInsertBody) {
		const productBatch = await this.productBatchRepository.insertOne(oid, body)
		return productBatch
	}

	async updateOne(oid: number, id: number, body: ProductBatchUpdateBody) {
		const { affected } = await this.productBatchRepository.update({ id, oid }, body)
		if (affected !== 1) {
			throw new HttpException(ErrorMessage.Database.UpdateFailed, HttpStatus.BAD_REQUEST)
		}
		const productBatch = await this.productBatchRepository.findOne({ id, oid })
		return productBatch
	}

	async deleteOne(oid: number, id: number) {
		try {
			await this.productBatchRepository.delete(oid, id)
			return { success: true }
		} catch (error) {
			return { success: false, message: error.message }
		}
	}
}
