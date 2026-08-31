import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchPaginationQuery,
} from '@api-public/resource/batch-resource/batch-get.query'
import { BatchUpdateInfoBody } from '@api-public/resource/batch-resource/batch-upsert.body'
import { BatchRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BatchResource {
  constructor(private readonly batchRepository: BatchRepository) {}

  async pagination(oid: number, query: BatchPaginationQuery) {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.batchRepository.pagination({
      relation,
      relationLoadStrategy: 'query',
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

    return { batchList: data, page, limit, total }
  }

  async getList(oid: number, query: BatchGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const batchList = await this.batchRepository.findMany({
      relation,
      relationLoadStrategy: 'query',
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
    return { batchList }
  }

  async getOne(oid: number, id: number, query: BatchGetOneQuery) {
    const batch = await this.batchRepository.findOne({
      relation: query.relation,
      condition: { oid, id },
    })
    return { batch }
  }

  async updateInfo(oid: number, id: number, body: BatchUpdateInfoBody) {
    const batch = await this.batchRepository.updateOne({ id, oid }, body)

    return { batch }
  }
}
