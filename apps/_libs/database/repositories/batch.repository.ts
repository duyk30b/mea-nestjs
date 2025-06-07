import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Batch } from '../entities'
import {
  BatchInsertType,
  BatchRelationType,
  BatchSortType,
  BatchUpdateType,
} from '../entities/batch.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  ReceiptItemManager,
  StockCheckItemManager,
  TicketBatchManager,
  TicketProductManager,
} from '../managers'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class BatchRepository extends _PostgreSqlRepository<
  Batch,
  BatchRelationType,
  BatchInsertType,
  BatchUpdateType,
  BatchSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Batch) private batchRepository: Repository<Batch>,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private receiptItemManager: ReceiptItemManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private stockCheckItemManager: StockCheckItemManager
  ) {
    super(Batch, batchRepository)
  }

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

      await this.receiptItemManager.update(
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

      return batchTargetModified
    })
  }
}
