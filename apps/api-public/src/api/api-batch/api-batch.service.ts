import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import { Organization } from '../../../../_libs/database/entities'
import { BatchMovementInsertType } from '../../../../_libs/database/entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../../../_libs/database/entities/product-movement.entity'
import { ProductOperation } from '../../../../_libs/database/operations'
import {
  BatchMovementRepository,
  BatchRepository,
  OrganizationRepository,
  ProductMovementRepository,
  ProductRepository,
  ReceiptItemRepository,
  TicketProductRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchInsertBody,
  BatchPaginationQuery,
  BatchUpdateInfoAndQuantityBody,
  BatchUpdateInfoBody,
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
    private readonly batchMovementRepository: BatchMovementRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly productOperation: ProductOperation
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
    const batch = await this.batchRepository.findOne({
      condition: { oid, id },
      relation: query.relation,
    })
    return { data: { batch } }
  }

  async createOne(oid: number, body: BatchInsertBody): Promise<BaseResponse> {
    const batch = await this.batchRepository.insertOneFullFieldAndReturnEntity({ ...body, oid })
    return { data: { batch } }
  }

  async updateInfo(oid: number, id: number, body: BatchUpdateInfoBody): Promise<BaseResponse> {
    const [batch] = await this.batchRepository.updateAndReturnEntity({ id, oid }, body)
    if (!batch) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Batch',
      })
    }
    this.socketEmitService.batchUpsert(oid, { batch })
    return { data: { batch } }
  }

  async updateInfoAndQuantity(options: {
    oid: number
    batchId: number
    userId: number
    body: BatchUpdateInfoAndQuantityBody
  }): Promise<BaseResponse> {
    const { oid, batchId, userId, body } = options
    const batchOrigin = await this.batchRepository.findOne({
      relation: { product: true },
      condition: { oid, id: batchId },
    })
    const [batchUpdated] = await this.batchRepository.updateAndReturnEntity(
      { id: batchId, oid },
      body as any
    )
    if (!batchUpdated) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Batch',
      })
    }
    this.socketEmitService.batchUpsert(oid, { batch: batchUpdated })

    if (
      batchOrigin.quantity === batchUpdated.quantity
      && batchOrigin.costPrice === batchUpdated.costPrice
    ) {
      return { data: { batch: batchUpdated } }
    }

    const batchMovement: BatchMovementInsertType = {
      oid,
      batchId,
      productId: batchOrigin.productId,
      warehouseId: batchOrigin.warehouseId,
      contactId: userId,
      movementType: MovementType.UserChange,
      voucherId: 0,
      openQuantity: batchOrigin.quantity,
      quantity: batchUpdated.quantity - batchOrigin.quantity,
      closeQuantity: batchUpdated.quantity,
      actualPrice: batchUpdated.costPrice,
      expectedPrice: batchOrigin.costPrice,
      isRefund: 0,
      unitRate: 1,
      createdAt: Date.now(),
    }
    this.batchMovementRepository.insertOneFullField(batchMovement)

    const productUpdated = await this.productOperation.calculateQuantityProduct({
      oid,
      productId: batchOrigin.productId,
    })

    const productMovement: ProductMovementInsertType = {
      oid,
      productId: batchOrigin.productId,
      warehouseId: batchOrigin.warehouseId,
      contactId: userId,
      movementType: MovementType.UserChange,
      voucherId: 0,
      openQuantity: batchOrigin.product.quantity,
      quantity: productUpdated.quantity - batchOrigin.product.quantity,
      closeQuantity: productUpdated.quantity,
      costPrice: batchOrigin.costPrice,
      actualPrice: batchUpdated.costPrice,
      expectedPrice: batchOrigin.costPrice,
      isRefund: 0,
      unitRate: 1,
      createdAt: Date.now(),
    }
    this.productMovementRepository.insertOneFullField(productMovement)
    this.socketEmitService.productUpsert(oid, { product: productUpdated })
    return { data: { batch: batchUpdated, product: productUpdated } }
  }

  async destroyOne(options: {
    oid: number
    batchId: number
    organization: Organization
  }): Promise<BaseResponse> {
    const { oid, batchId, organization } = options
    const [receiptItemList, ticketProductList] = await Promise.all([
      this.receiptItemRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
      this.ticketProductRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
    ])
    if (receiptItemList.length > 0 || ticketProductList.length > 0) {
      return {
        data: { receiptItemList, ticketProductList },
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

    return { data: { batchId, receiptItemList: [], ticketProductList: [] } }
  }
}
