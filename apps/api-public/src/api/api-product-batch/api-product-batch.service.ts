import { Injectable } from '@nestjs/common'
import { NoExtra } from '../../../../_libs/common/dto'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { ProductBatch } from '../../../../_libs/database/entities'
import { ProductBatchRepository, ProductRepository } from '../../../../_libs/database/repository'
import { ProductBatchGetManyQuery, ProductBatchGetOneQuery, ProductBatchPaginationQuery } from './request'

@Injectable()
export class ApiProductBatchService {
    constructor(
        private readonly productBatchRepository: ProductBatchRepository,
        private readonly productRepository: ProductRepository
    ) {}

    async pagination(oid: number, query: ProductBatchPaginationQuery) {
        const { page, limit, filter, sort, relation } = query
        const { total, data } = await this.productBatchRepository.pagination({
            page,
            limit,
            condition: {
                oid,
                productId: filter?.productId,
                quantity: filter?.quantity,
                isActive: filter?.isActive,
                expiryDate: filter?.expiryDate,
            },
            sort: sort || { id: 'DESC' },
        })

        if (relation?.product && data.length) {
            const productIds = uniqueArray(data.map((i) => i.productId))
            const products = await this.productRepository.findManyBy({ id: { IN: productIds } })
            data.forEach((i) => (i.product = products.find((j) => j.id === i.productId)))
        }

        return { page, limit, total, data }
    }

    async getList(oid: number, query: ProductBatchGetManyQuery) {
        const productBatches = await this.productBatchRepository.findMany({
            condition: {
                oid,
                productId: query.filter?.productId,
                quantity: query.filter?.quantity,
                isActive: query.filter?.isActive,
            },
            limit: query.limit,
        })
        if (query.relation?.product && productBatches.length) {
            const products = await this.productRepository.findManyBy({
                oid,
                id: { IN: uniqueArray(productBatches.map((item) => item.productId)) },
            })
            productBatches.forEach((item) => {
                item.product = products.find((pr) => pr.id === item.productId)
            })
        }
        return productBatches
    }

    async getOne(oid: number, id: number, query: ProductBatchGetOneQuery) {
        const productBatch = await this.productBatchRepository.findOne({
            condition: { oid, id },
            relation: { product: query.relation?.product },
        })
        return productBatch
    }

    async createOne<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>> & { productId: number }>(
        oid: number,
        body: NoExtra<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>, T>
    ) {
        const productBatch = await this.productBatchRepository.insertOne({ ...body, oid })
        return productBatch
    }

    async updateOne<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>>(
        oid: number,
        id: number,
        body: NoExtra<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity' | 'productId'>>, T>
    ) {
        await this.productBatchRepository.update({ id, oid }, body)
        const productBatch = await this.productBatchRepository.findOneBy({ id, oid })
        return productBatch
    }

    async deleteOne(oid: number, id: number) {
        await this.productBatchRepository.delete({ oid, id })
        return { success: true }
    }
}
