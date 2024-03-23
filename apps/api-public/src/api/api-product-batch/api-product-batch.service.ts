import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { NoExtra } from '../../../../_libs/common/helpers/typescript.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ProductBatch } from '../../../../_libs/database/entities'
import { ProductBatchRepository, ProductRepository } from '../../../../_libs/database/repository'
import {
  ProductBatchGetManyQuery,
  ProductBatchGetOneQuery,
  ProductBatchInsertBody,
  ProductBatchPaginationQuery,
  ProductBatchUpdateBody,
} from './request'

@Injectable()
export class ApiProductBatchService {
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async pagination(oid: number, query: ProductBatchPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.productBatchRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        quantity: filter?.quantity,
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

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getList(oid: number, query: ProductBatchGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const productBatches = await this.productBatchRepository.findMany({
      // relation,
      condition: {
        oid,
        productId: filter?.productId,
        quantity: filter?.quantity,
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
    return { data: productBatches }
  }

  async getOne(oid: number, id: number, query: ProductBatchGetOneQuery): Promise<BaseResponse> {
    const { relation } = query
    const data = await this.productBatchRepository.findOne({
      condition: { oid, id, deletedAt: { IS_NULL: true } },
      relation: relation?.product,
    })
    return { data }
  }

  async createOne(oid: number, body: ProductBatchInsertBody): Promise<BaseResponse> {
    const id = await this.productBatchRepository.insertOne({ ...body, oid })
    const productEffected = await this.productRepository.update(
      { oid, id: body.productId },
      {
        lastExpiryDate: body.expiryDate,
        lastCostPrice: body.costPrice,
        lastWholesalePrice: body.wholesalePrice,
        lastRetailPrice: body.retailPrice,
      }
    )

    const productBatch = await this.productBatchRepository.findOneById(id)
    return { data: productBatch }
  }

  async updateOne(oid: number, id: number, body: ProductBatchUpdateBody): Promise<BaseResponse> {
    await this.productBatchRepository.update({ id, oid }, body)
    const data = await this.productBatchRepository.findOneBy({ id, oid })
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.productBatchRepository.update(
      { oid, id },
      { deletedAt: Date.now() }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.productBatchRepository.findOneBy({ id, oid })
    return { data }
  }
}
