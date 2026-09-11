import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchPaginationQuery,
} from '@api-public/resource/batch-resource/batch-get.query'
import { BatchRelationQuery } from '@api-public/resource/batch-resource/batch-options.request'
import { ESArray } from '@libs/common/helpers'
import { Batch, Distributor, Product } from '@libs/database/entities'
import {
  BatchRepository,
  DistributorRepository,
  ProductRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BatchResource {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository,
    private readonly distributorRepository: DistributorRepository
  ) {}

  async pagination(oid: number, query: BatchPaginationQuery) {
    const { page, limit, filter, sort, relation } = query
    const { total, data: batchList } = await this.batchRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        id: filter?.id,
        warehouseId: filter?.warehouseId,
        distributorId: filter?.distributorId,
        productId: filter?.productId,
        quantity: filter?.quantity,
        expiryDate: filter?.expiryDate,
        updatedAt: filter?.updatedAt,
        registeredAt: filter?.registeredAt,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation({ oid, batchList, relation })
    }

    return { batchList, page, limit, total }
  }

  async getList(oid: number, query: BatchGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const batchList = await this.batchRepository.findMany({
      condition: {
        oid,
        id: filter?.id,
        warehouseId: filter?.warehouseId,
        distributorId: filter?.distributorId,
        productId: filter?.productId,
        quantity: filter?.quantity,
        expiryDate: filter?.expiryDate,
        updatedAt: filter?.updatedAt,
        registeredAt: filter?.registeredAt,
        $OR: filter?.$OR,
      },
      limit,
      sort: sort || undefined,
    })

    if (relation) {
      await this.generateRelation({ oid, batchList, relation })
    }

    return { batchList }
  }

  async getOne(oid: number, id: number, query: BatchGetOneQuery) {
    const batch = await this.batchRepository.findOne({
      relation: query.relation,
      condition: { oid, id },
    })

    if (query.relation) {
      await this.generateRelation({ oid, batchList: [batch], relation: query.relation })
    }

    return { batch }
  }

  async generateRelation(options: {
    oid: number
    batchList: Batch[]
    relation: BatchRelationQuery
  }) {
    const { oid, batchList, relation } = options
    const batchIdList = ESArray.uniqueArray(batchList.map((i) => i.id))
    const productIdList = ESArray.uniqueArray(batchList.map((i) => i.productId))
    const distributorIdList = ESArray.uniqueArray(batchList.map((i) => i.distributorId))

    const [productList, distributorList] = await Promise.all([
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({ oid, id: { IN: productIdList } })
        : <Product[]>[],
      relation?.distributor && distributorIdList.length
        ? this.distributorRepository.findManyBy({ oid, id: { IN: distributorIdList } })
        : <Distributor[]>[],
    ])

    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')

    batchList.forEach((batch: Batch) => {
      if (relation?.product) {
        batch.product = productMap[batch.productId]
      }
      if (relation?.distributor) {
        batch.distributor = distributorMap[batch.distributorId]
      }
    })

    return batchList
  }
}
