import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyArray, uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
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
    private readonly socketEmitService: SocketEmitService,
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository
  ) { }

  async pagination(oid: number, query: ProductPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { total, data } = await this.productRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        productGroupId: filter?.productGroupId,
        isActive: filter?.isActive,
        quantity: filter?.quantity,
        expiryDate: filter?.expiryDate,
        $OR: filter?.$OR,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    const productHasBatchesList = data.filter((i) => i.hasManageBatches)
    const productHasBatchesIds = uniqueArray(productHasBatchesList.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        productId: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = arrayToKeyArray(batchList, 'productId')
      data.forEach((item) => {
        item.batchList = batchListMapProductId[item.id] || []
      })
    }

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getList(oid: number, query: ProductGetManyQuery): Promise<BaseResponse> {
    const { filter, limit, relation } = query

    const productList = await this.productRepository.findMany({
      // relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        productGroupId: filter?.productGroupId,
        quantity: filter?.quantity,
        expiryDate: filter?.expiryDate,
        $OR: filter?.$OR,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })

    const productHasBatchesList = productList.filter((i) => i.hasManageBatches)
    const productHasBatchesIds = uniqueArray(productHasBatchesList.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        id: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = arrayToKeyArray(batchList, 'productId')
      productList.forEach((item) => {
        item.batchList = batchListMapProductId[item.id] || []
      })
    }
    return { data: productList }
  }

  async getOne(oid: number, id: number, query: ProductGetOneQuery): Promise<BaseResponse> {
    const { relation, filter } = query
    const product = await this.productRepository.findOne({
      relation: { productGroup: relation?.productGroup },
      condition: { oid, id },
    })
    if (!product) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (relation?.batchList && product.hasManageBatches) {
      product.batchList = await this.batchRepository.findMany({
        condition: {
          oid,
          productId: product.id,
          quantity: filter?.batchList?.quantity,
          expiryDate: filter?.batchList.expiryDate,
        },
        sort: { expiryDate: 'ASC' },
      })
    }
    return { data: { product } }
  }

  async createOne(oid: number, body: ProductCreateBody): Promise<BaseResponse> {
    const product = await this.productRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    this.socketEmitService.productUpsert(oid, { product })
    return { data: { product } }
  }

  async updateOne(oid: number, id: number, body: ProductUpdateBody): Promise<BaseResponse> {
    const rootProduct = await this.productRepository.findOneById(id)
    if (rootProduct.quantity) {
      if (!body.hasManageQuantity) {
        throw new BusinessException('error.Product.ConflictManageQuantity')
      }
      if (body.hasManageBatches !== rootProduct.hasManageBatches) {
        throw new BusinessException('error.Product.ConflictManageBatches')
      }
    }
    const [product] = await this.productRepository.updateAndReturnEntity({ oid, id }, body)
    if (!product) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.socketEmitService.productUpsert(oid, { product })
    return { data: { product } }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.productRepository.update(
      { oid, id },
      {
        deletedAt: Date.now(),
      }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const product = await this.productRepository.findOneBy({ id })
    return { data: { product } }
  }
}
