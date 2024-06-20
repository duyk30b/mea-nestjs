import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchInsertBody,
  BatchPaginationQuery,
  BatchUpdateBody,
} from './request'

@Injectable()
export class ApiBatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async pagination(oid: number, query: BatchPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.batchRepository.pagination({
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
      sort,
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

  async getList(oid: number, query: BatchGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const batches = await this.batchRepository.findMany({
      // relation,
      condition: {
        oid,
        productId: filter?.productId,
        quantity: filter?.quantity,
        expiryDate: filter?.expiryDate,
        updatedAt: filter?.updatedAt,
      },
      limit,
      sort: sort || undefined,
    })
    if (relation?.product && batches.length) {
      const products = await this.productRepository.findManyBy({
        oid,
        id: { IN: uniqueArray(batches.map((item) => item.productId)) },
      })
      batches.forEach((item) => {
        item.product = products.find((pr) => pr.id === item.productId)
      })
    }
    return { data: batches }
  }

  async getOne(oid: number, id: number, query: BatchGetOneQuery): Promise<BaseResponse> {
    const { relation } = query
    const data = await this.batchRepository.findOne({
      condition: { oid, id },
      relation: relation?.product,
    })
    return { data }
  }

  async createOne(oid: number, body: BatchInsertBody): Promise<BaseResponse> {
    const id = await this.batchRepository.insertOne({ ...body, oid })

    const batch = await this.batchRepository.findOneById(id)
    return { data: batch }
  }

  async updateOne(oid: number, id: number, body: BatchUpdateBody): Promise<BaseResponse> {
    await this.batchRepository.update({ id, oid }, body)
    const data = await this.batchRepository.findOneBy({ id, oid })
    return { data }
  }
}
