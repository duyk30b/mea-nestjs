import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Product } from '../../../../_libs/database/entities'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { ReceiptItemRepository } from '../../../../_libs/database/repository/receipt-item/receipt-item.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ProductAndBatchUpsertBody, ReceiptItemPaginationQuery } from './request'

@Injectable()
export class ApiReceiptItemService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
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
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async upsertProductAndBatch(oid: number, body: ProductAndBatchUpsertBody) {
    const data = { product: null, batch: null } as { product: Product; batch: Batch }
    if (body.product) {
      const productListUpdated = await this.productRepository.updateAndReturnEntity(
        { oid, id: body.product.productId },
        {
          costPrice: body.product.costPrice,
          wholesalePrice: body.product.wholesalePrice,
          retailPrice: body.product.retailPrice,
        }
      )
      const product = productListUpdated[0]
      this.socketEmitService.productUpsert(oid, { product })
      data.product = product
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
        const batch = await this.batchRepository.insertOneFullFieldAndReturnEntity({
          ...body.batch,
          oid,
        })
        this.socketEmitService.batchUpsert(oid, { batch })
        data.batch = batch
      }
    }

    return { data }
  }
}
