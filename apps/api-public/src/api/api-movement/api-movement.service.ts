import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import {
  Batch,
  Invoice,
  Product,
  ProductMovement,
  Receipt,
} from '../../../../_libs/database/entities'
import BatchMovement from '../../../../_libs/database/entities/batch-movement.entity'
import { BatchMovementRepository } from '../../../../_libs/database/repository/batch/bat-movement.repository'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { ProductMovementRepository } from '../../../../_libs/database/repository/product/product-movement.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { BatchMovementPaginationQuery, ProductMovementPaginationQuery } from './request'

@Injectable()
export class ApiMovementService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly batchMovementRepository: BatchMovementRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly receiptRepository: ReceiptRepository
  ) {}

  async paginationProductMovement(
    oid: number,
    query: ProductMovementPaginationQuery
  ): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.productMovementRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        type: filter?.type,
      },
      sort: sort || { id: 'DESC' },
    })

    const invoiceIds = data.filter((i) => i.type === MovementType.Invoice).map((i) => i.referenceId)
    const receiptIds = data.filter((i) => i.type === MovementType.Receipt).map((i) => i.referenceId)
    const productIds = data.map((i) => i.productId)

    const [invoiceList, receiptList, productList] = await Promise.all([
      invoiceIds.length
        ? this.invoiceRepository.findMany({
            condition: { id: { IN: uniqueArray(invoiceIds) } },
            relation: { customer: true },
          })
        : [],
      receiptIds.length
        ? this.receiptRepository.findMany({
            condition: { id: { IN: uniqueArray(receiptIds) } },
            relation: { distributor: true },
          })
        : [],
      productIds.length
        ? this.productRepository.findMany({
            condition: { id: { IN: uniqueArray(productIds) } },
          })
        : [],
    ])

    data.forEach((mov: ProductMovement) => {
      mov.product = productList.find((p) => p.id === mov.productId)
      if (mov.type === MovementType.Invoice) {
        mov.invoice = invoiceList.find((iv) => iv.id === mov.referenceId)
      } else if (mov.type === MovementType.Receipt) {
        mov.receipt = receiptList.find((rc) => rc.id === mov.referenceId)
      }
    })

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async paginationBatchMovement(
    oid: number,
    query: BatchMovementPaginationQuery
  ): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.batchMovementRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        batchId: filter?.batchId,
        type: filter?.type,
      },
      sort: sort || { id: 'DESC' },
    })

    const invoiceIds = data.filter((i) => i.type === MovementType.Invoice).map((i) => i.referenceId)
    const receiptIds = data.filter((i) => i.type === MovementType.Receipt).map((i) => i.referenceId)
    const productIds = data.map((i) => i.productId)
    const batchIds = data.map((i) => i.batchId)

    const [invoiceList, receiptList, productList, batchList] = await Promise.all([
      invoiceIds.length
        ? this.invoiceRepository.findMany({
            condition: { id: { IN: uniqueArray(invoiceIds) } },
            relation: { customer: true },
          })
        : <Invoice[]>[],
      receiptIds.length
        ? this.receiptRepository.findMany({
            condition: { id: { IN: uniqueArray(receiptIds) } },
            relation: { distributor: true },
          })
        : <Receipt[]>[],
      productIds.length
        ? this.productRepository.findMany({
            condition: { id: { IN: uniqueArray(productIds) } },
          })
        : <Product[]>[],
      batchIds.length
        ? this.batchRepository.findMany({
            condition: { id: { IN: uniqueArray(batchIds) } },
          })
        : <Batch[]>[],
    ])

    data.forEach((mov: BatchMovement) => {
      mov.product = productList.find((p) => p.id === mov.productId)
      mov.batch = batchList.find((p) => p.id === mov.productId)
      if (mov.type === MovementType.Invoice) {
        mov.invoice = invoiceList.find((iv) => iv.id === mov.referenceId)
      } else if (mov.type === MovementType.Receipt) {
        mov.receipt = receiptList.find((rc) => rc.id === mov.referenceId)
      }
    })

    return {
      data,
      meta: { total, page, limit },
    }
  }
}
