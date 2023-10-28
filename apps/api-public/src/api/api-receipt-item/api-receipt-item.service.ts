import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Product } from '../../../../_libs/database/entities'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { ReceiptItemRepository } from '../../../../_libs/database/repository/receipt-item/receipt-item.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { ProductAndBatchUpsertBody, ReceiptItemPaginationQuery } from './request'

@Injectable()
export class ApiReceiptItemService {
  constructor(
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async pagination(oid: number, query: ReceiptItemPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.receiptItemRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        receiptId: filter?.receiptId,
        productId: filter?.productId,
        batchId: filter?.batchId,
      },
      sort: sort || { id: 'DESC' },
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async upsertProductAndBatch(oid: number, body: ProductAndBatchUpsertBody) {
    const data = { product: null, batch: null } as { product: Product; batch: Batch }
    if (body.product) {
      const affected = await this.productRepository.update(
        { oid, id: body.product.productId },
        {
          costPrice: body.product.costPrice,
          wholesalePrice: body.product.wholesalePrice,
          retailPrice: body.product.retailPrice,
        }
      )
      if (affected != 1) {
        throw new BusinessException('error.Database.UpdateFailed')
      }
      data.product = await this.productRepository.findOneBy({ oid, id: body.product.productId })
    }
    if (body.batch) {
      const batchList = await this.batchRepository.findManyBy({
        oid,
        productId: body.batch.productId,
      })
      const batchFind = batchList.find((b) => {
        return b.lotNumber == body.batch.lotNumber && b.expiryDate == body.batch.expiryDate
      })
      if (batchFind) {
        data.batch = batchFind
      } else {
        const batchId = await this.batchRepository.insertOne({ ...body.batch, oid })
        data.batch = await this.batchRepository.findOneById(batchId)
      }
    }

    return { data }
  }
}
