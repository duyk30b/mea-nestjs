import { Injectable } from '@nestjs/common'
import { BusinessException } from '_libs/common/exception-filter/business-exception.filter'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ProductBatchRepository, ProductRepository } from '_libs/database/repository'
import {
    ProductCreateBody,
    ProductGetManyQuery,
    ProductGetOneQuery,
    ProductPaginationQuery,
    ProductUpdateBody,
} from './request'

@Injectable()
export class ApiProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly productBatchRepository: ProductBatchRepository
    ) {}

    async pagination(oid: number, query: ProductPaginationQuery) {
        const { page, limit, filter, sort, relation } = query

        const { total, data } = await this.productRepository.pagination({
            page,
            limit,
            condition: {
                oid,
                group: filter?.group,
                isActive: filter?.isActive,
                searchText: filter?.searchText,
                quantity: filter?.quantity,
            },
            order: sort || { id: 'DESC' },
        })

        if (relation?.productBatches && data.length) {
            const productIds = uniqueArray(data.map((item) => item.id))
            const productBatches = await this.productBatchRepository.findMany({
                productIds,
                quantity: ['!=', 0],
                isActive: true,
            })
            data.forEach(
                (item) =>
                    (item.productBatches = productBatches
                        .filter((ma) => ma.productId === item.id)
                        .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1)))
            )
        }

        return { total, page, limit, data }
    }

    async getList(oid: number, query: ProductGetManyQuery) {
        const { filter, limit, relation } = query

        const products = await this.productRepository.find({
            condition: {
                oid,
                isActive: filter?.isActive,
                group: filter?.group,
                searchText: filter?.searchText,
                quantity: filter?.quantity,
            },
            limit,
        })

        if (relation?.productBatches && products.length) {
            const productIds = uniqueArray(products.map((item) => item.id))
            const productBatches = await this.productBatchRepository.findMany({
                productIds,
                quantity: ['!=', 0],
                isActive: true,
            })
            products.forEach((item) => {
                item.productBatches = productBatches
                    .filter((ma) => ma.productId === item.id)
                    .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
            })
        }
        return products
    }

    async getOne(oid: number, id: number, query: ProductGetOneQuery) {
        const product = await this.productRepository.findOne({ oid, id })
        if (!product) {
            throw new BusinessException('common.Product.NotExist')
        }
        if (query.relation?.productBatches) {
            const batches = await this.productBatchRepository.findMany({
                oid,
                productId: product.id,
                quantity: ['!=', 0],
            })
            product.productBatches = batches.sort((a, b) => {
                return (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1
            })
        }
        return product
    }

    async createOne(oid: number, body: ProductCreateBody) {
        return await this.productRepository.insertOne(oid, body)
    }

    async updateOne(oid: number, id: number, body: ProductUpdateBody) {
        const { affected } = await this.productRepository.update({ id, oid }, body)
        if (affected !== 1) throw new Error('Database.UpdateFailed')
        return await this.productRepository.findOne({ id })
    }
}
