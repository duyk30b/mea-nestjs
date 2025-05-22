import { Body, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import { ProductMovementInsertType } from '../../../../_libs/database/entities/product-movement.entity'
import { ProductOperation } from '../../../../_libs/database/operations'
import {
  BatchRepository,
  ProductMovementRepository,
  ReceiptItemRepository,
  TicketBatchRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchInsertBody,
  BatchMergeBody,
  BatchPaginationQuery,
  BatchUpdateInfoAndQuantityBody,
  BatchUpdateInfoBody,
} from './request'

@Injectable()
export class ApiBatchService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly batchRepository: BatchRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly productOperation: ProductOperation
  ) {}

  async pagination(oid: number, query: BatchPaginationQuery): Promise<BaseResponse> {
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

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getList(oid: number, query: BatchGetManyQuery): Promise<BaseResponse> {
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
        $OR: filter.$OR,
      },
      limit,
      sort: sort || undefined,
    })
    return { data: { batchList } }
  }

  async getOne(oid: number, id: number, query: BatchGetOneQuery): Promise<BaseResponse> {
    const batch = await this.batchRepository.findOne({
      relation: query.relation,
      condition: { oid, id },
    })
    return { data: { batch } }
  }

  async createOne(oid: number, body: BatchInsertBody): Promise<BaseResponse> {
    const batch = await this.batchRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      quantity: 0,
      registeredAt: Date.now(),
    })
    return { data: { batch } }
  }

  async updateInfo(oid: number, id: number, body: BatchUpdateInfoBody): Promise<BaseResponse> {
    const batch = await this.batchRepository.updateOneAndReturnEntity({ id, oid }, body)
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
    const batchUpdated = await this.batchRepository.updateOneAndReturnEntity(
      { id: batchId, oid },
      body as any
    )
    if (
      batchOrigin.quantity === batchUpdated.quantity
      && batchOrigin.costPrice === batchUpdated.costPrice
    ) {
      return { data: { batch: batchUpdated } }
    }

    const productUpdated = await this.productOperation.calculateQuantityProduct({
      oid,
      productId: batchOrigin.productId,
    })

    const productMovement: ProductMovementInsertType = {
      oid,
      movementType: MovementType.UserChange,
      contactId: userId,
      voucherId: 0,
      voucherProductId: 0,
      warehouseId: batchOrigin.warehouseId,
      productId: batchOrigin.productId,
      batchId: batchOrigin.id,
      isRefund: 0,
      unitRate: 1,
      openQuantity: batchOrigin.product.quantity,
      quantity: batchUpdated.quantity - batchOrigin.quantity,
      closeQuantity: productUpdated.quantity,
      costPrice: batchUpdated.costPrice,
      actualPrice: batchUpdated.costPrice,
      expectedPrice: batchOrigin.costPrice,
      createdAt: Date.now(),
    }
    this.productMovementRepository.insertOneFullField(productMovement)
    this.socketEmitService.productUpsert(oid, { product: productUpdated })
    return { data: { batch: batchUpdated, product: productUpdated } }
  }

  async batchMerge(options: { oid: number; body: BatchMergeBody }) {
    const { oid, body } = options
    const { batchIdSource, batchIdTarget, productId } = body

    await this.batchRepository.mergeBatch({ oid, productId, batchIdSource, batchIdTarget })
    await this.receiptItemRepository.update(
      { oid, productId, batchId: batchIdSource },
      { batchId: batchIdTarget }
    )
    await this.ticketBatchRepository.update(
      { oid, productId, batchId: batchIdSource },
      { batchId: batchIdTarget }
    )
    await this.productMovementRepository.update(
      { oid, productId, batchId: batchIdSource },
      { batchId: batchIdTarget }
    )
    return { data: true }
  }

  async destroyOne(options: { oid: number; batchId: number }): Promise<BaseResponse> {
    const { oid, batchId } = options
    const [receiptItemList, ticketBatchList] = await Promise.all([
      this.receiptItemRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
      this.ticketBatchRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
    ])
    if (receiptItemList.length > 0 || ticketBatchList.length > 0) {
      return {
        data: { receiptItemList, ticketBatchList },
        success: false,
      }
    }

    await this.batchRepository.delete({ oid, id: batchId })

    return { data: { batchId, receiptItemList: [], ticketBatchList: [] } }
  }
}
