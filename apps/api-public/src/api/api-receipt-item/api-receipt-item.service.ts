import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ReceiptItemRepository } from '../../../../_libs/database/repository/receipt-item/receipt-item.repository'
import { ReceiptItemPaginationQuery } from './request'

@Injectable()
export class ApiReceiptItemService {
  constructor(private readonly receiptItemRepository: ReceiptItemRepository) {}

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
}
