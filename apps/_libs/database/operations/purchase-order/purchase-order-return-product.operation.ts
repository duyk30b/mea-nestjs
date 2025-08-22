import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType, PickupStrategy } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  PurchaseOrderItemManager, PurchaseOrderManager,
} from '../../repositories'
import { ProductPickingOperation } from '../product/product-picking.operation'

@Injectable()
export class PurchaseOrderReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private productPickingOperation: ProductPickingOperation
  ) { }

  async returnAllProduct(params: {
    oid: number
    purchaseOrderId: number
    time: number
    description?: string
  }) {
    const { oid, purchaseOrderId, time } = params
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. PURCHASE_ORDER: update PURCHASE_ORDER ===
      const purchaseOrder = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: PurchaseOrderStatus.Executing,
          deliveryStatus: DeliveryStatus.Delivered,
        },
        { deliveryStatus: DeliveryStatus.Pending } // purchaseOrder
      )

      const purchaseOrderItemOriginList = await this.purchaseOrderItemManager.findManyBy(manager, {
        oid,
        purchaseOrderId,
      })
      const purchaseOrderItemOriginMap = ESArray.arrayToKeyValue(purchaseOrderItemOriginList, 'id')
      if (purchaseOrderItemOriginList.length === 0) return { purchaseOrder }

      // === 2. Product and Batch origin
      const productIdList = purchaseOrderItemOriginList.map((i) => i.productId)
      const batchIdList = purchaseOrderItemOriginList.map((i) => i.batchId)
      const productOriginList = await this.productManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(productIdList) }, isActive: 1 },
        { updatedAt: time }
      )
      const batchOriginList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(batchIdList) }, isActive: 1 },
        { updatedAt: time }
      )
      const pickingContainer = this.productPickingOperation.generatePickingPlan({
        productOriginList,
        batchOriginList,
        voucherBatchList: purchaseOrderItemOriginList.map((i) => {
          return {
            ...i,
            voucherProductId: i.id,
            voucherBatchId: 0,
            warehouseIds: JSON.stringify([i.warehouseId]),
            costAmount: i.costPrice * i.quantity,
            pickupStrategy: i.batchId
              ? PickupStrategy.RequireBatchSelection
              : PickupStrategy.NoImpact,
          }
        }),
        allowNegativeQuantity: true,
      })

      // 3. === UPDATE for PRODUCT and BATCH ===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: pickingContainer.pickingProductList.map((i) => {
          return {
            id: i.productId,
            pickingQuantity: i.pickingQuantity, // không cộng trừ theo nó
            quantity: i.closeQuantity,
          }
        }),
        update: ['quantity'],
        options: { requireEqualLength: true },
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id', 'productId'],
        tempList: pickingContainer.pickingBatchList.map((i) => {
          return {
            id: i.batchId,
            productId: i.productId,
            pickingQuantity: i.pickingQuantity,
            pickingCostAmount: i.pickingCostAmount,
          }
        }),
        update: {
          quantity: () => `"quantity" - "pickingQuantity"`,
          costAmount: () => `"costAmount" - "pickingCostAmount"`,
        },
        options: { requireEqualLength: true },
      })
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

      // === 5. PRODUCT_MOVEMENT: insert ===
      const productMovementInsertList = pickingContainer.pickingMovementList.map((paMovement) => {
        const riOrigin = purchaseOrderItemOriginMap[paMovement.voucherProductId]
        const batch = batchModifiedMap[paMovement.batchId] // có thể null
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.PurchaseOrder,
          contactId: purchaseOrder.distributorId,
          voucherId: purchaseOrderId,
          voucherProductId: riOrigin.id,
          warehouseId: riOrigin.warehouseId,
          productId: riOrigin.productId,
          batchId: riOrigin.batchId,

          createdAt: time,
          isRefund: 1,
          expectedPrice: riOrigin.costPrice,
          actualPrice: riOrigin.costPrice,

          quantity: -paMovement.pickingQuantity,
          costAmount: -paMovement.pickingCostAmount,
          openQuantityProduct: paMovement.openQuantityProduct,
          closeQuantityProduct: paMovement.closeQuantityProduct,
          openQuantityBatch: paMovement.openQuantityBatch,
          closeQuantityBatch: paMovement.closeQuantityBatch,
          openCostAmountBatch: paMovement.openCostAmountBatch,
          closeCostAmountBatch: paMovement.closeCostAmountBatch,
        }

        return productMovementInsert
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      return {
        purchaseOrder,
        purchaseOrderItemList: purchaseOrderItemOriginMap,
        productList: productModifiedList,
        batchList: batchModifiedList,
      }
    })

    return transaction
  }
}
