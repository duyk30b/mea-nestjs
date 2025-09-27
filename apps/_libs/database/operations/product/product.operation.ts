import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { MovementType } from '../../common/variable'
import { Product } from '../../entities'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
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
export class ProductOperation {
  constructor(
    private dataSource: DataSource,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private stockCheckItemManager: StockCheckItemManager,
    private productMovementManager: ProductMovementManager,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async reCalculateQuantityBySumBatch(options: { oid: number; productId: number }) {
    const { oid, productId } = options
    const resultQuery: [any[], number] = await this.manager.query(`
        UPDATE  "Product"
        SET     "quantity" = ( 
                    SELECT COALESCE(SUM("quantity"), 0)
                    FROM "Batch" WHERE "productId" = ${productId}
                )
        WHERE   "id" = ${productId} AND "oid" = ${oid}
        RETURNING *
    `)
    if (resultQuery[0].length !== 1) {
      throw new Error(`Update Product failed`)
    }
    return Product.fromRaw(resultQuery[0][0])
  }

  async reCalculateQuantityBySumBatchList(options: { oid: number; productIdList: number[] }) {
    const { oid, productIdList } = options
    const resultQuery: [any[], number] = await this.manager.query(`
        UPDATE  "Product" "product" 
        SET     "quantity" = "sbq"."sumQuantity"
        FROM    ( 
                SELECT "productId", SUM("quantity") as "sumQuantity" 
                    FROM "Batch" 
                    WHERE "Batch"."productId" IN (${productIdList.toString()})
                        AND "Batch"."oid" = ${oid}
                    GROUP BY "productId" 
                ) AS "sbq" 
        WHERE   "product"."id" = "sbq"."productId" 
            AND "product"."id" IN (${productIdList.toString()})
            AND "product"."oid" = ${oid}
        RETURNING "Product".*
    `)
    return Product.fromRaws(resultQuery[0])
  }

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
      await this.purchaseOrderItemManager.update(
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
      // await this.productMovementManager.delete(manager, {
      //   oid,
      //   productId: { IN: productIdSourceList },
      // })

      await this.productMovementManager.update(
        manager,
        { oid, productId: { IN: productIdSourceList } },
        { productId: productIdTarget }
      )

      const productMovement: ProductMovementInsertType = {
        oid,
        movementType: MovementType.UserChange,
        contactId: userId,
        voucherId: '0',
        voucherProductId: '0',
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
