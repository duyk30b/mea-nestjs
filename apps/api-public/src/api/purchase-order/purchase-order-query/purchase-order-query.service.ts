import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../../_libs/common/helpers/array.helper'
import { Distributor, Product, PurchaseOrder, PurchaseOrderItem } from '../../../../../_libs/database/entities'
import Batch from '../../../../../_libs/database/entities/batch.entity'
import Payment, { PaymentVoucherType } from '../../../../../_libs/database/entities/payment.entity'
import {
  DistributorRepository,
  PaymentRepository,
  ProductRepository,
  PurchaseOrderItemRepository,
} from '../../../../../_libs/database/repositories'
import { BatchRepository } from '../../../../../_libs/database/repositories/batch.repository'
import { PurchaseOrderRepository } from '../../../../../_libs/database/repositories/purchase-order.repository'
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
    private readonly paymentRepository: PaymentRepository
  ) { }

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

    const [purchaseOrderItemList, distributorList, paymentList] = await Promise.all([
      relation?.purchaseOrderItemList && purchaseOrderIdList.length
        ? this.purchaseOrderItemRepository.findManyBy({ purchaseOrderId: { IN: purchaseOrderIdList } })
        : <PurchaseOrderItem[]>[],
      relation?.distributor && distributorIdList.length
        ? this.distributorRepository.findManyBy({ id: { IN: distributorIdList } })
        : <Distributor[]>[],
      relation?.paymentList && purchaseOrderIdList.length
        ? this.paymentRepository.findMany({
          condition: {
            voucherId: { IN: purchaseOrderIdList },
            voucherType: PaymentVoucherType.PurchaseOrder,
          },
          sort: { id: 'ASC' },
        })
        : <Payment[]>[],
    ])

    purchaseOrderList.forEach((r: PurchaseOrder) => {
      r.purchaseOrderItemList = purchaseOrderItemList.filter((ri) => ri.purchaseOrderId === r.id)
      r.distributor = distributorList.find((d) => d.id === r.distributorId)
      r.paymentList = paymentList.filter((p) => p.voucherId === r.id)
    })

    if (relation?.purchaseOrderItemList) {
      const productIdList = ESArray.uniqueArray(purchaseOrderItemList.map((i) => i.productId))
      const batchIdList = ESArray.uniqueArray(purchaseOrderItemList.map((i) => i.batchId))

      const [productList, batchList] = await Promise.all([
        relation?.purchaseOrderItemList?.product && productIdList.length
          ? this.productRepository.findManyBy({ id: { IN: productIdList } })
          : <Product[]>[],
        relation?.purchaseOrderItemList?.batch && batchIdList.length
          ? this.batchRepository.findManyBy({ id: { IN: batchIdList } })
          : <Batch[]>[],
      ])
      const productMap = ESArray.arrayToKeyValue(productList, 'id')
      const batchMap = ESArray.arrayToKeyValue(batchList, 'id')

      purchaseOrderItemList.forEach((ri) => {
        ri.batch = batchMap[ri.batchId]
        ri.product = productMap[ri.productId]
      })
    }

    return purchaseOrderList
  }
}
