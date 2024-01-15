import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { ProductBatchRepository, ProductRepository } from '../../../../_libs/database/repository'
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
            // relation,
            page,
            limit,
            condition: {
                oid,
                group: filter?.group,
                isActive: filter?.isActive,
                quantity: filter?.quantity,
                $OR: filter?.searchText
                    ? [{ brandName: { LIKE: filter.searchText } }, { substance: { LIKE: filter.searchText } }]
                    : undefined,
                updatedAt: filter?.updatedAt,
            },
            sort: sort || { id: 'DESC' },
        })

        if (relation?.productBatches && data.length) {
            const productIds = uniqueArray(data.map((item) => item.id))
            const productBatches = await this.productBatchRepository.findManyBy({
                productId: { IN: productIds },
                // quantity: { NOT: 0 }, // cứ lấy hết số lượng 0, về frontend convert sau
                isActive: 1,
                deletedAt: { IS_NULL: true },
            })
            data.forEach((item) => {
                item.productBatches = productBatches
                    .filter((ma) => ma.productId === item.id)
                    .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
            })
        }

        return { total, page, limit, data }
    }

    async getList(oid: number, query: ProductGetManyQuery) {
        const { filter, limit, relation } = query

        const products = await this.productRepository.findMany({
            // relation,
            condition: {
                oid,
                isActive: filter?.isActive,
                group: filter?.group,
                quantity: filter?.quantity,
                $OR: filter?.searchText
                    ? [{ brandName: { LIKE: filter.searchText } }, { substance: { LIKE: filter.searchText } }]
                    : undefined,
                updatedAt: filter?.updatedAt,
            },
            limit,
        })

        if (relation?.productBatches && products.length) {
            const productIds = uniqueArray(products.map((item) => item.id))
            const productBatches = await this.productBatchRepository.findManyBy({
                id: { IN: productIds },
                quantity: filter?.productBatch?.quantity,
                isActive: filter?.productBatch?.isActive,
                deletedAt: { IS_NULL: true },
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
        const product = await this.productRepository.findOneBy({ oid, id })
        if (!product) {
            throw new BusinessException('common.Product.NotExist')
        }
        if (query.relation?.productBatches) {
            const batches = await this.productBatchRepository.findManyBy({
                oid,
                productId: product.id,
                quantity: { '!=': 0 },
            })
            product.productBatches = batches.sort((a, b) => {
                return (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1
            })
        }
        return product
    }

    async createOne(oid: number, body: ProductCreateBody) {
        const id = await this.productRepository.insertOne({ ...body, oid })
        const data = await this.productRepository.findOneById(id)
        return data
    }

    async updateOne(oid: number, id: number, body: ProductUpdateBody) {
        const affected = await this.productRepository.update({ id, oid }, body)
        const data = await this.productRepository.findOneBy({ id })
        return data
    }

    async deleteOne(oid: number, id: number) {
        const affected = await this.productRepository.update({ oid, id }, { deletedAt: Date.now() })
        if (affected === 0) {
            throw new Error('Không thể xóa bản ghi')
        }
        const data = await this.productRepository.findOneBy({ id })
        return data
    }
}
