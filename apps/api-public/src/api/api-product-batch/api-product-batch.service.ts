import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { NoExtra } from '../../../../_libs/common/helpers/typescript.helper'
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
            // relation,
            page,
            limit,
            condition: {
                oid,
                productId: filter?.productId,
                quantity: filter?.quantity,
                isActive: filter?.isActive,
                expiryDate: filter?.expiryDate,
                updatedAt: filter?.updatedAt,
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
        const { limit, filter, relation } = query

        const productBatches = await this.productBatchRepository.findMany({
            // relation,
            condition: {
                oid,
                productId: filter?.productId,
                quantity: filter?.quantity,
                isActive: filter?.isActive,
                updatedAt: filter?.updatedAt,
            },
            limit,
        })
        if (relation?.product && productBatches.length) {
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
        const { relation } = query
        const data = await this.productBatchRepository.findOne({
            condition: { oid, id, deletedAt: { IS_NULL: true } },
            relation: relation?.product,
        })
        return data
    }

    async createOne<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>> & { productId: number }>(
        oid: number,
        body: NoExtra<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>, T>
    ) {
        const id = await this.productBatchRepository.insertOne({ ...body, oid })
        const data = await this.productBatchRepository.findOneById(id)
        return data
    }

    async updateOne<T extends Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity'>>>(
        oid: number,
        id: number,
        body: NoExtra<Partial<Omit<ProductBatch, 'id' | 'oid' | 'quantity' | 'productId'>>, T>
    ) {
        await this.productBatchRepository.update({ id, oid }, body)
        const data = await this.productBatchRepository.findOneBy({ id, oid })
        return data
    }

    async deleteOne(oid: number, id: number) {
        const affected = await this.productBatchRepository.update({ oid, id }, { deletedAt: Date.now() })
        if (affected === 0) {
            throw new Error('Không thể xóa bản ghi')
        }
        const data = await this.productBatchRepository.findOneBy({ id, oid })
        return data
    }
}
