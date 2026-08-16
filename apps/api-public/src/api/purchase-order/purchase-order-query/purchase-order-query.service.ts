import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers/array.helper'
import {
  Batch,
  Distributor,
  Payment,
  PaymentPurchaseOrder,
  Product,
  PurchaseOrder,
  PurchaseOrderItem,
} from '@libs/database/entities'
import {
  DistributorRepository,
  PaymentPurchaseOrderRepository,
  PaymentRepository,
  ProductRepository,
  PurchaseOrderItemRepository,
} from '@libs/database/repositories'
import { BatchRepository } from '@libs/database/repositories/batch.repository'
import { PurchaseOrderRepository } from '@libs/database/repositories/purchase-order.repository'
import { Injectable } from '@nestjs/common'
import {
  PurchaseOrderGetManyQuery,
  PurchaseOrderGetOneQuery,
  PurchaseOrderPaginationQuery,
  PurchaseOrderRelationQuery,
} from './request'

@Injectable()
export class ApiPurchaseOrderQueryService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository,
    private readonly paymentPurchaseOrderRepository: PaymentPurchaseOrderRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async pagination(oid: number, query: PurchaseOrderPaginationQuery) {
    const { page, limit, filter, sort, relation } = query
    const { startedAt, distributorId, status } = query.filter || {}

    const { total, data: purchaseOrderList } = await this.purchaseOrderRepository.pagination({
      page: query.page,
      limit: query.limit,
      condition: {
        oid,
        distributorId,
        status,
        startedAt,
      },
      sort: query.sort || { id: 'DESC' },
    })

    if (query.relation) {
      await this.generateRelation(purchaseOrderList, query.relation)
    }

    return { purchaseOrderList, total, page, limit }
  }

  async getMany(oid: number, query: PurchaseOrderGetManyQuery) {
    const { relation, limit } = query
    const { startedAt, distributorId, status } = query.filter || {}

    const purchaseOrderList = await this.purchaseOrderRepository.findMany({
      condition: {
        oid,
        distributorId,
        status,
        startedAt,
      },
      limit,
    })

    if (query.relation) {
      await this.generateRelation(purchaseOrderList, query.relation)
    }

    return { purchaseOrderList }
  }

  async getOne(oid: number, purchaseOrderId: string, query: PurchaseOrderGetOneQuery) {
    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({ oid, id: purchaseOrderId })
    if (!purchaseOrder) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (query.relation) {
      await this.generateRelation([purchaseOrder], query.relation)
    }

    return { purchaseOrder }
  }

  async generateRelation(purchaseOrderList: PurchaseOrder[], relation: PurchaseOrderRelationQuery) {
    const purchaseOrderIdList = ESArray.uniqueArray(purchaseOrderList.map((i) => i.id))
    const distributorIdList = ESArray.uniqueArray(purchaseOrderList.map((i) => i.distributorId))

    const [purchaseOrderItemList, distributorList, paymentPurchaseOrderList] = await Promise.all([
      relation?.purchaseOrderItemList && purchaseOrderIdList.length
        ? this.purchaseOrderItemRepository.findManyBy({
            purchaseOrderId: { IN: purchaseOrderIdList },
          })
        : <PurchaseOrderItem[]>[],
      relation?.distributor && distributorIdList.length
        ? this.distributorRepository.findManyBy({ id: { IN: distributorIdList } })
        : <Distributor[]>[],
      relation?.paymentPurchaseOrderList && purchaseOrderIdList.length
        ? this.paymentPurchaseOrderRepository.findMany({
            condition: {
              purchaseOrderId: { IN: purchaseOrderIdList },
            },
            sort: { id: 'ASC' },
          })
        : <PaymentPurchaseOrder[]>[],
    ])

    const productIdList = ESArray.uniqueArray(purchaseOrderItemList.map((i) => i.productId))
    const batchIdList = ESArray.uniqueArray(purchaseOrderItemList.map((i) => i.batchId))
    const paymentIdList = ESArray.uniqueArray(paymentPurchaseOrderList.map((i) => i.paymentId))

    const [productList, batchList, paymentList] = await Promise.all([
      relation?.purchaseOrderItemList?.product && productIdList.length
        ? this.productRepository.findManyBy({ id: { IN: productIdList } })
        : <Product[]>[],
      relation?.purchaseOrderItemList?.batch && batchIdList.length
        ? this.batchRepository.findManyBy({ id: { IN: batchIdList } })
        : <Batch[]>[],
      relation?.paymentPurchaseOrderList?.payment && paymentIdList.length
        ? this.paymentRepository.findManyBy({ id: { IN: paymentIdList } })
        : <Payment[]>[],
    ])
    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const batchMap = ESArray.arrayToKeyValue(batchList, 'id')
    const paymentMap = ESArray.arrayToKeyValue(paymentList, 'id')

    if (relation?.purchaseOrderItemList) {
      purchaseOrderItemList.forEach((ri) => {
        if (relation?.purchaseOrderItemList.product) {
          ri.product = productMap[ri.productId]
        }
        if (relation?.purchaseOrderItemList.batch) {
          ri.batch = batchMap[ri.batchId]
        }
      })
    }

    if (relation?.paymentPurchaseOrderList) {
      paymentPurchaseOrderList.forEach((ri) => {
        if (relation?.paymentPurchaseOrderList.payment) {
          ri.payment = paymentMap[ri.paymentId]
        }
      })
    }

    purchaseOrderList.forEach((r: PurchaseOrder) => {
      r.purchaseOrderItemList = purchaseOrderItemList.filter((ri) => {
        return ri.purchaseOrderId === r.id
      })
      r.distributor = distributorList.find((d) => {
        return d.id === r.distributorId
      })
      r.paymentPurchaseOrderList = paymentPurchaseOrderList.filter((p) => {
        return p.purchaseOrderId === r.id
      })
    })

    return purchaseOrderList
  }
}
