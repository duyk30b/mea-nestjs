import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  PurchaseOrderRepository,
} from '../../repositories'

@Injectable()
export class PurchaseOrderReopenOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository
  ) { }

  // Hàm này mục đích để quay về tạo thành 1 trường hợp chưa thanh toán
  async reopen(params: {
    oid: number
    purchaseOrderId: string
  }) {
    const { oid, purchaseOrderId } = params

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. PURCHASE_ORDER: update ===
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: { IN: [PurchaseOrderStatus.Debt, PurchaseOrderStatus.Completed] },
        },
        { endedAt: null, status: PurchaseOrderStatus.Executing }
      )

      return { purchaseOrderModified }
    })

    return transaction
  }
}
