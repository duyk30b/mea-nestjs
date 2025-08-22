import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { PurchaseOrderItem } from '../../entities'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  PurchaseOrderItemManager, PurchaseOrderManager,
} from '../../repositories'
import { ProductPutawayOperation } from '../product/product-putaway.operation'

@Injectable()
export class PurchaseOrderSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private productPutawayOperation: ProductPutawayOperation
  ) { }

  async sendProduct(params: { oid: number; userId: number; purchaseOrderId: number; time: number }) {
    const { oid, userId, purchaseOrderId, time } = params
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} ship and payment failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: initData ===
      const purchaseOrder = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: { IN: [PurchaseOrderStatus.Draft, PurchaseOrderStatus.Deposited, PurchaseOrderStatus.Executing] },
        },
        { status: PurchaseOrderStatus.Executing, deliveryStatus: DeliveryStatus.Delivered }
      )
      const purchaseOrderItemOriginList = await this.purchaseOrderItemManager.findManyBy(manager, {
        oid,
        purchaseOrderId,
      })
      if (purchaseOrderItemOriginList.length === 0) return { purchaseOrder }

      const purchaseOrderItemOriginMap = ESArray.arrayToKeyValue(purchaseOrderItemOriginList, 'id')

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
      const putawayContainer = this.productPutawayOperation.generatePutawayPlan({
        productOriginList,
        batchOriginList,
        voucherBatchList: purchaseOrderItemOriginList.map((i) => {
          return {
            ...i,
            voucherProductId: i.id,
            warehouseId: i.warehouseId,
            voucherBatchId: 0, // purchaseOrder không sử dụng, purchaseOrder chỉ sử dụng purchaseOrderProduct
            costAmount: i.costPrice * i.quantity,
          }
        }),
      })

      // === 3. Update Product and Batch ===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: putawayContainer.putawayProductList.map((i) => {
          let purchaseOrderItem: PurchaseOrderItem
          purchaseOrderItemOriginList.forEach((ri) => {
            if (ri.productId === i.productId) purchaseOrderItem = ri // cập nhật giá theo thằng cuối cùng
          })
          return {
            id: i.productId,
            quantity: i.closeQuantity,
            putawayQuantity: i.putawayQuantity, // không được cộng trừ theo thằng này, vì với trường hợp NoImpact nó vẫn nhặt
            costPrice: purchaseOrderItem.costPrice,
            retailPrice: purchaseOrderItem.listPrice,
          }
        }),
        update: ['quantity', 'costPrice', 'retailPrice'],
        options: { requireEqualLength: true },
      })

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id', 'productId'],
        tempList: putawayContainer.putawayBatchList
          .filter((i) => !!i.batchId)
          .map((i) => {
            let purchaseOrderItem: PurchaseOrderItem
            purchaseOrderItemOriginList.forEach((ri) => {
              if (ri.batchId === i.batchId) purchaseOrderItem = ri // cập nhật giá theo thằng cuối cùng
            })
            return {
              id: i.batchId,
              productId: i.productId,
              warehouseId: purchaseOrderItem.warehouseId,
              distributorId: purchaseOrderItem.distributorId,
              lotNumber: purchaseOrderItem.lotNumber,
              expiryDate: purchaseOrderItem.expiryDate,
              costPrice: purchaseOrderItem.costPrice,
              putawayQuantity: i.putawayQuantity,
              putawayCostAmount: i.putawayCostAmount,
            }
          }),
        update: {
          warehouseId: true, // luôn luôn ghi đè
          distributorId: true, // luôn luôn ghi đè
          lotNumber: true,
          expiryDate: { cast: 'bigint' }, // luôn luôn ghi đè
          costPrice: true, // luôn luôn ghi đè
          quantity: () => `"quantity" + "putawayQuantity"`,
          costAmount: () => `"costAmount" + "putawayCostAmount"`,
        },
        options: { requireEqualLength: true },
      })

      // === 4. Insert Movement ===
      const productMovementInsertList = putawayContainer.putawayMovementList.map((paMovement) => {
        const purchaseOrderItem = purchaseOrderItemOriginMap[paMovement.voucherProductId]
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.PurchaseOrder,
          contactId: purchaseOrder.distributorId,
          voucherId: purchaseOrder.id,
          voucherProductId: purchaseOrderItem.id,
          warehouseId: paMovement.warehouseId,
          productId: paMovement.productId,
          batchId: paMovement.batchId,

          createdAt: time,
          isRefund: 0,
          expectedPrice: purchaseOrderItem.costPrice,
          actualPrice: purchaseOrderItem.costPrice,

          quantity: paMovement.putawayQuantity,
          costAmount: paMovement.putawayCostAmount,
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
        purchaseOrderItemList: purchaseOrderItemOriginList,
        productList: productModifiedList,
        batchList: batchModifiedList,
      }
    })
    return transaction
  }
}
