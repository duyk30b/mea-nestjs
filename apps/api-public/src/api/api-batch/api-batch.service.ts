import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import { ProductMovementInsertType } from '../../../../_libs/database/entities/product-movement.entity'
import { ProductOperation } from '../../../../_libs/database/operations'
import {
  BatchRepository,
  OrganizationRepository,
  ProductMovementRepository,
  ProductRepository,
  ReceiptItemRepository,
  TicketBatchRepository,
  TicketProductRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchMergeBody,
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
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly productOperation: ProductOperation
  ) { }

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
        $OR: filter?.$OR,
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

  async updateInfo(oid: number, id: number, body: BatchUpdateInfoBody): Promise<BaseResponse> {
    const batch = await this.batchRepository.updateOneAndReturnEntity({ id, oid }, body)

    this.socketEmitService.batchListChange(oid, { batchUpsertedList: [batch] })
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
      {
        lotNumber: body.lotNumber,
        expiryDate: body.expiryDate,
        warehouseId: body.warehouseId,
        distributorId: body.distributorId,
        costPrice: body.costPrice,
        quantity: body.quantity,
        costAmount: body.costAmount,
      }
    )
    if (
      batchOrigin.quantity === batchUpdated.quantity
      && batchOrigin.costAmount === batchUpdated.costAmount
    ) {
      return { data: { batch: batchUpdated } }
    }

    const productUpdated = await this.productOperation.reCalculateQuantityBySumBatch({
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

      quantity: batchUpdated.quantity - batchOrigin.quantity,
      costAmount: batchUpdated.costAmount - batchOrigin.costAmount,

      openQuantityProduct: batchOrigin.product.quantity,
      closeQuantityProduct: productUpdated.quantity,
      openQuantityBatch: batchOrigin.quantity,
      closeQuantityBatch: batchUpdated.quantity,
      openCostAmountBatch: batchOrigin.costAmount,
      closeCostAmountBatch: batchUpdated.costAmount,

      actualPrice: batchUpdated.costPrice,
      expectedPrice: batchOrigin.costPrice,
      createdAt: Date.now(),
    }
    this.productMovementRepository.insertOneFullField(productMovement)

    this.socketEmitService.productListChange(oid, { productUpsertedList: [productUpdated] })
    this.socketEmitService.batchListChange(oid, { batchUpsertedList: [batchUpdated] })

    return { data: { batch: batchUpdated, product: productUpdated } }
  }

  async destroyOne(options: { oid: number; batchId: number }): Promise<BaseResponse> {
    const { oid, batchId } = options
    const [receiptItemList, ticketBatchList, ticketProductList] = await Promise.all([
      this.receiptItemRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
      this.ticketBatchRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
      this.ticketProductRepository.findMany({
        condition: { oid, batchId },
        limit: 10,
      }),
    ])
    if (receiptItemList.length > 0 || ticketBatchList.length > 0 || ticketProductList.length > 0) {
      return {
        data: { receiptItemList, ticketBatchList, ticketProductList },
        success: false,
      }
    }

    const batchDestroyed = await this.batchRepository.deleteOneAndReturnEntity({ oid, id: batchId })
    const productUpdated = await this.productRepository.updateOneAndReturnEntity(
      { oid, id: batchDestroyed.productId },
      { quantity: () => `quantity - ${batchDestroyed.quantity}` }
    )

    await this.organizationRepository.updateDataVersion(oid)
    this.cacheDataService.clearOrganization(oid)

    this.socketEmitService.productListChange(oid, { productUpsertedList: [productUpdated] })
    this.socketEmitService.batchListChange(oid, { batchDestroyedList: [batchDestroyed] })

    return {
      data: {
        batchId,
        product: productUpdated,
        receiptItemList: [],
        ticketBatchList: [],
        ticketProductList: [],
      },
    }
  }

  async batchMerge(options: { oid: number; body: BatchMergeBody }) {
    const { oid, body } = options
    const { batchIdSourceList, batchIdTarget, productId } = body

    batchIdSourceList.forEach((i) => {
      if (isNaN(i) || i <= 0) {
        throw new BusinessException('error.ValidateFailed')
      }
    })
    const { batchModified, batchDestroyedList } = await this.batchRepository.mergeBatch({
      oid,
      productId,
      batchIdSourceList,
      batchIdTarget,
    })

    await this.organizationRepository.updateDataVersion(oid)
    this.cacheDataService.clearOrganization(oid)

    this.socketEmitService.batchListChange(oid, {
      batchDestroyedList,
      batchUpsertedList: [batchModified],
    })

    return { data: true }
  }
}
