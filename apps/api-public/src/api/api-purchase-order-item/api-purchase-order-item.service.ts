import { Injectable } from '@nestjs/common'
import { PurchaseOrderItemRepository } from '../../../../_libs/database/repositories/purchase-order-item.repository'
import { PurchaseOrderItemPaginationQuery } from './request'

@Injectable()
export class ApiPurchaseOrderItemService {
  constructor(private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository) { }

  async pagination(oid: number, query: PurchaseOrderItemPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: purchaseOrderItemList } =
      await this.purchaseOrderItemRepository.pagination({
        relation,
        page,
        limit,
        condition: {
          oid,
          purchaseOrderId: filter?.purchaseOrderId,
          distributorId: filter?.distributorId,
          productId: filter?.productId,
          batchId: filter?.batchId,
        },
        sort,
      })

    return { purchaseOrderItemList, page, limit, total }
  }
}
