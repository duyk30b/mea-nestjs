import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  PurchaseOrderItemManager,
  StockCheckItemManager,
  TicketBatchManager,
  TicketProductManager,
} from '../../repositories'

@Injectable()
export class BatchOperator {
  constructor(
    private dataSource: DataSource,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private stockCheckItemManager: StockCheckItemManager
  ) { }

  async mergeBatch(options: {
    oid: number
    productId: number
    batchIdSourceList: number[]
    batchIdTarget: number
  }) {
    const { oid, productId, batchIdSourceList, batchIdTarget } = options

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const batchSourceList = await this.batchManager.deleteAndReturnEntity(manager, {
        oid,
        productId,
        id: { IN: batchIdSourceList },
      })

      const quantitySourceAdd = batchSourceList.reduce((acc, item) => acc + item.quantity, 0)
      const costAmountSourceAdd = batchSourceList.reduce((acc, item) => acc + item.costAmount, 0)

      const batchTargetModified = await this.batchManager.updateOneAndReturnEntity(
        manager,
        { oid, id: batchIdTarget, productId },
        {
          quantity: () => `quantity + ${quantitySourceAdd}`,
          costAmount: () => `"costAmount" + ${costAmountSourceAdd}`,
        }
      )

      await this.purchaseOrderItemManager.update(
        manager,
        { oid, productId, batchId: { IN: batchIdSourceList } },
        { batchId: batchIdTarget }
      )
      await this.ticketProductManager.update(
        manager,
        { oid, productId, batchId: { IN: batchIdSourceList } },
        { batchId: batchIdTarget }
      )
      await this.ticketBatchManager.update(
        manager,
        { oid, productId, batchId: { IN: batchIdSourceList } },
        { batchId: batchIdTarget }
      )
      await this.stockCheckItemManager.update(
        manager,
        { oid, productId, batchId: { IN: batchIdSourceList } },
        { batchId: batchIdTarget }
      )
      await this.productMovementManager.update(
        manager,
        { oid, productId, batchId: { IN: batchIdSourceList } },
        { batchId: batchIdTarget }
      )

      return {
        batchDestroyedList: batchSourceList,
        batchModified: batchTargetModified,
      }
    })
  }
}
