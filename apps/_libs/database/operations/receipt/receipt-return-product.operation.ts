import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType, PickupStrategy } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import {
    BatchManager,
    ProductManager,
    ProductMovementManager,
    ReceiptItemManager,
    ReceiptManager,
} from '../../managers'
import { ProductPickingOperation } from '../product/product-picking.operation'

@Injectable()
export class ReceiptReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private productPickingOperation: ProductPickingOperation
  ) { }

  async returnAllProduct(params: {
    oid: number
    receiptId: number
    time: number
    description?: string
  }) {
    const { oid, receiptId, time } = params
    const PREFIX = `ReceiptId=${receiptId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. RECEIPT: update RECEIPT ===
      const receipt = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          status: ReceiptStatus.Executing,
          deliveryStatus: DeliveryStatus.Delivered,
        },
        { deliveryStatus: DeliveryStatus.Pending } // receipt
      )

      const receiptItemOriginList = await this.receiptItemManager.findManyBy(manager, {
        oid,
        receiptId,
      })
      const receiptItemOriginMap = ESArray.arrayToKeyValue(receiptItemOriginList, 'id')
      if (receiptItemOriginList.length === 0) return { receipt }

      // === 2. Product and Batch origin
      const productIdList = receiptItemOriginList.map((i) => i.productId)
      const batchIdList = receiptItemOriginList.map((i) => i.batchId)
      const productOriginList = await this.productManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(productIdList) } },
        { updatedAt: time }
      )
      const batchOriginList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(batchIdList) } },
        { updatedAt: time }
      )
      const pickingContainer = this.productPickingOperation.generatePickingPlan({
        productOriginList,
        batchOriginList,
        voucherBatchList: receiptItemOriginList.map((i) => {
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
        const riOrigin = receiptItemOriginMap[paMovement.voucherProductId]
        const batch = batchModifiedMap[paMovement.batchId] // có thể null
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.Receipt,
          contactId: receipt.distributorId,
          voucherId: receiptId,
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
        receipt,
        receiptItemList: receiptItemOriginMap,
        productList: productModifiedList,
        batchList: batchModifiedList,
      }
    })

    return transaction
  }
}
