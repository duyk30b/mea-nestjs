import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
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
    private readonly batchRepository: BatchRepository
  ) {}

  async pagination(oid: number, query: ProductPaginationQuery): Promise<BaseResponse> {
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

    if (relation?.batches && data.length) {
      const productIds = uniqueArray(data.map((item) => item.id))
      const batches = await this.batchRepository.findManyBy({
        productId: { IN: productIds },
        quantity: { NOT: 0 }, // cứ lấy hết số lượng 0, về frontend convert sau
      })

      data.forEach((item) => {
        item.batches = batches
          .filter((ma) => ma.productId === item.id)
          .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
      })
    }

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getList(oid: number, query: ProductGetManyQuery): Promise<BaseResponse> {
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

    if (relation?.batches && products.length) {
      const productIds = uniqueArray(products.map((item) => item.id))
      const batches = await this.batchRepository.findManyBy({
        id: { IN: productIds },
        quantity: filter?.batches?.quantity,
      })
      products.forEach((item) => {
        item.batches = batches
          .filter((ma) => ma.productId === item.id)
          .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
      })
    }
    return { data: products }
  }

  async getOne(oid: number, id: number, query: ProductGetOneQuery): Promise<BaseResponse> {
    const product = await this.productRepository.findOneBy({ oid, id })
    if (!product) {
      throw new BusinessException('error.Product.NotExist')
    }
    if (query.relation?.batches) {
      const batches = await this.batchRepository.findManyBy({
        oid,
        productId: product.id,
        quantity: { '!=': 0 },
      })
      product.batches = batches.sort((a, b) => {
        return (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1
      })
    }
    return { data: product }
  }

  async createOne(oid: number, body: ProductCreateBody): Promise<BaseResponse> {
    const id = await this.productRepository.insertOne({ ...body, oid })
    const product = await this.productRepository.findOneById(id)
    return { data: product }
  }

  async updateOne(oid: number, id: number, body: ProductUpdateBody): Promise<BaseResponse> {
    const rootProduct = await this.productRepository.findOneById(id)
    if (rootProduct.quantity && !body.hasManageQuantity) {
      throw new BusinessException('error.Product.ConflictManageQuantity')
    }

    const affected = await this.productRepository.update({ id, oid }, body)
    const product = await this.productRepository.findOneBy({ id })

    return { data: product }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.productRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.productRepository.findOneBy({ id })
    return { data }
  }
}
