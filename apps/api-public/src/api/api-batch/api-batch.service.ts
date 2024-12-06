import { HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Organization } from '../../../../_libs/database/entities'
import { BatchMovementRepository } from '../../../../_libs/database/repository/batch-movement/bat-movement.repository'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { ReceiptItemRepository } from '../../../../_libs/database/repository/receipt-item/receipt-item.repository'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
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
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly batchMovementRepository: BatchMovementRepository
  ) { }

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

  async destroyOne(options: {
    oid: number
    batchId: number
    organization: Organization
  }): Promise<BaseResponse> {
    const { oid, batchId, organization } = options
    const countReceiptItem = await this.receiptItemRepository.countBy({ oid, batchId })
    const countTicketProduct = await this.ticketProductRepository.countBy({ oid, batchId })
    if (countReceiptItem > 0 || countTicketProduct > 0) {
      return {
        data: { countReceiptItem, countTicketProduct },
        success: false,
      }
    }

    await Promise.allSettled([
      this.batchRepository.delete({ oid, id: batchId }),
      this.batchMovementRepository.delete({ oid, batchId }),
    ])

    organization.dataVersionParse.batch += 1
    await this.organizationRepository.update(
      { id: oid },
      {
        dataVersion: JSON.stringify(organization.dataVersionParse),
      }
    )
    this.cacheDataService.clearOrganization(oid)

    return { data: { countTicketProduct: 0, countReceiptItem: 0, batchId } }
  }

  async findOrCreateOne(oid: number, body: BatchInsertBody): Promise<BaseResponse> {
    const batchList = await this.batchRepository.findManyBy({
      oid,
      productId: body.productId,
    })
    const batchFind = batchList.find((b) => {
      return b.costPrice == body.costPrice && b.expiryDate == body.expiryDate
    })
    if (batchFind) {
      return { data: { batch: batchFind } }
    }
    const batch = await this.batchRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    this.socketEmitService.batchUpsert(oid, { batch })

    return { data: { batch } }
  }
}
