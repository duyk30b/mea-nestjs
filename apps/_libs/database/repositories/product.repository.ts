import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { MovementType } from '../common/variable'
import { Product } from '../entities'
import { ProductMovementInsertType } from '../entities/product-movement.entity'
import {
  ProductInsertType,
  ProductRelationType,
  ProductSortType,
  ProductUpdateType,
} from '../entities/product.entity'
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
export class ProductRepository extends _PostgreSqlRepository<
  Product,
  ProductRelationType,
  ProductInsertType,
  ProductUpdateType,
  ProductSortType
> {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private dataSource: DataSource,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private receiptItemManager: ReceiptItemManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private stockCheckItemManager: StockCheckItemManager
  ) {
    super(Product, productRepository)
  }

  // async getMaxCode(oid: number) {
  //   const raw = await this.productRepository
  //     .createQueryBuilder()
  //     .select('MAX("Product".code)', 'max_code')
  //     .where({ oid })
  //     .getRawOne()
  //   return raw?.max_code || 0
  // }

  async mergeProduct(options: {
    oid: number
    userId: number
    productIdSourceList: number[]
    productIdTarget: number
  }) {
    const { oid, userId, productIdSourceList, productIdTarget } = options

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const productSourceList = await this.productManager.deleteAndReturnEntity(manager, {
        oid,
        id: { IN: productIdSourceList },
      })
      const quantitySourceAdd = productSourceList.reduce((acc, item) => acc + item.quantity, 0)

      const productTargetModified = await this.productManager.updateOneAndReturnEntity(
        manager,
        { oid, id: productIdTarget },
        { quantity: () => `quantity + ${quantitySourceAdd}` }
      )

      const batchModifiedList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )
      await this.receiptItemManager.update(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )
      await this.ticketProductManager.update(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )
      await this.ticketBatchManager.update(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )
      await this.stockCheckItemManager.update(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )
      await this.productMovementManager.delete(manager, {
        oid,
        productId: { IN: productIdSourceList },
      })

      const productMovement: ProductMovementInsertType = {
        oid,
        movementType: MovementType.UserChange,
        contactId: userId,
        voucherId: 0,
        voucherProductId: 0,
        warehouseId: 0,
        productId: productIdTarget,
        batchId: 0,
        isRefund: 0,

        quantity: quantitySourceAdd,
        costAmount: 0,

        openQuantityProduct: productTargetModified.quantity - quantitySourceAdd,
        closeQuantityProduct: productTargetModified.quantity,
        openQuantityBatch: 0,
        closeQuantityBatch: 0,
        openCostAmountBatch: 0,
        closeCostAmountBatch: 0,

        actualPrice: productTargetModified.costPrice,
        expectedPrice: productTargetModified.costPrice,
        createdAt: Date.now(),
      }

      await this.productMovementManager.insertOneFullField(manager, productMovement)

      return {
        productDestroyedList: productSourceList,
        productModified: productTargetModified,
        batchModifiedList,
      }
    })
  }
}
