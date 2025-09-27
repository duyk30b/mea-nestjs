import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType, PickupStrategy } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
} from '../../repositories'
import { ProductPickupManager } from '../product/product-pickup.manager'

@Injectable()
export class PurchaseOrderReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private productPickupManager: ProductPickupManager
  ) { }

  async returnAllProduct(params: {
    oid: number
    purchaseOrderId: string
    time: number
    description?: string
  }) {
    const { oid, purchaseOrderId, time } = params
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. PURCHASE_ORDER: update PURCHASE_ORDER ===
      const purchaseOrder = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: PurchaseOrderStatus.Executing,
          deliveryStatus: DeliveryStatus.Delivered,
        },
        { deliveryStatus: DeliveryStatus.Pending } // purchaseOrder
      )

      const purchaseOrderItemOriginList = await this.purchaseOrderItemRepository.managerFindManyBy(
        manager,
        { oid, purchaseOrderId }
      )
      const purchaseOrderItemOriginMap = ESArray.arrayToKeyValue(purchaseOrderItemOriginList, 'id')
      if (purchaseOrderItemOriginList.length === 0) return { purchaseOrder }

      // === 2. Product and Batch origin
      const pickupContainer = await this.productPickupManager.startPickup({
        manager,
        oid,
        voucherId: purchaseOrderId,
        contactId: purchaseOrder.distributorId,
        movementType: MovementType.PurchaseOrder,
        isRefund: 1,
        time,
        allowNegativeQuantity: false,
        voucherProductPickupList: purchaseOrderItemOriginList.map((i) => {
          return {
            pickupStrategy: PickupStrategy.RequireBatchSelection,
            expectedPrice: i.costPrice,
            actualPrice: i.costPrice,
            productId: i.productId,
            batchId: i.batchId,
            warehouseIds: JSON.stringify([i.warehouseId]),
            quantity: i.quantity,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
      })

      return {
        purchaseOrder,
        purchaseOrderItemList: purchaseOrderItemOriginMap,
        productModifiedList: pickupContainer.productModifiedList,
        batchModifiedList: pickupContainer.batchModifiedList,
      }
    })

    return transaction
  }
}
