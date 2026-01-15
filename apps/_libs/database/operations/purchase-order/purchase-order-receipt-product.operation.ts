import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  PurchaseOrderItemManager,
  PurchaseOrderManager,
} from '../../repositories'
import { ProductPutawayManager } from '../product/product-putaway.manager'

@Injectable()
export class PurchaseOrderSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private productPutawayManager: ProductPutawayManager
  ) { }

  async sendProduct(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    time: number
  }) {
    const { oid, userId, purchaseOrderId, time } = params
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} ship and payment failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: initData ===
      const purchaseOrderModified = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: {
            IN: [
              PurchaseOrderStatus.Draft,
              PurchaseOrderStatus.Deposited,
              PurchaseOrderStatus.Executing,
            ],
          },
        },
        { status: PurchaseOrderStatus.Executing, deliveryStatus: DeliveryStatus.Delivered }
      )
      const { distributorId } = purchaseOrderModified
      const purchaseOrderItemOriginList = await this.purchaseOrderItemManager.findManyBy(manager, {
        oid,
        purchaseOrderId,
      })
      if (purchaseOrderItemOriginList.length === 0) {
        return { purchaseOrderModified }
      }

      // === 2. Product and Batch origin
      const putawayContainer = await this.productPutawayManager.startPutaway({
        manager,
        oid,
        voucherId: purchaseOrderId,
        contactId: distributorId,
        time,
        movementType: MovementType.PurchaseOrder,
        isRefund: 0,
        voucherBatchPutawayList: purchaseOrderItemOriginList.map((i) => {
          return {
            voucherProductId: i.id,
            voucherBatchId: '0',
            warehouseId: i.warehouseId,
            productId: i.productId,
            batchId: i.batchId,
            costAmount: Math.round(i.unitCostPrice / i.unitQuantity),
            quantity: i.unitQuantity * i.unitRate,
            expectedPrice: Math.round(i.unitCostPrice / i.unitRate),
            actualPrice: Math.round(i.unitCostPrice / i.unitRate),
          }
        }),
      })

      const purchaseOrderItemOriginMapProductId = ESArray.arrayToKeyValue(
        purchaseOrderItemOriginList,
        'productId'
      )
      const purchaseOrderItemOriginMapBatchId = ESArray.arrayToKeyValue(
        purchaseOrderItemOriginList,
        'batchId'
      )

      // === 3. Update Product and Batch ===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: Object.values(purchaseOrderItemOriginMapProductId).map((i) => {
          return {
            id: i.productId,
            costPrice: Math.round(i.unitCostPrice / i.unitRate),
            retailPrice: Math.round(i.unitListPrice / i.unitRate),
          }
        }),
        update: ['costPrice', 'retailPrice'],
        options: { requireEqualLength: true },
      })

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id', 'productId'],
        tempList: Object.values(purchaseOrderItemOriginMapBatchId)
          .filter((i) => !!i.batchId)
          .map((i) => {
            return {
              id: i.batchId,
              productId: i.productId,
              warehouseId: i.warehouseId,
              distributorId: i.distributorId,
              lotNumber: i.lotNumber,
              expiryDate: i.expiryDate,
              costPrice: Math.floor(i.unitCostPrice / i.unitRate),
            }
          }),
        update: {
          warehouseId: true, // luôn luôn ghi đè
          distributorId: true, // luôn luôn ghi đè
          lotNumber: true,
          expiryDate: { cast: 'bigint' }, // luôn luôn ghi đè
          costPrice: true, // luôn luôn ghi đè
        },
        options: { requireEqualLength: true },
      })

      return {
        purchaseOrderModified,
        purchaseOrderItemList: purchaseOrderItemOriginList,
        productModifiedList,
        batchModifiedList,
      }
    })
    return transaction
  }
}
