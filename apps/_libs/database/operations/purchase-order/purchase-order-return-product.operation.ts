import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType, PickupStrategy } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { PurchaseOrderItemRepository, PurchaseOrderRepository } from '../../repositories'
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
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: PurchaseOrderStatus.Executing,
          deliveryStatus: DeliveryStatus.Delivered,
        },
        { deliveryStatus: DeliveryStatus.Pending } // purchaseOrder
      )
      const { distributorId } = purchaseOrderModified

      const purchaseOrderItemOriginList = await this.purchaseOrderItemRepository.managerFindManyBy(
        manager,
        { oid, purchaseOrderId }
      )
      const purchaseOrderItemOriginMap = ESArray.arrayToKeyValue(purchaseOrderItemOriginList, 'id')
      if (purchaseOrderItemOriginList.length === 0) {
        return { purchaseOrderModified }
      }

      // === 2. Product and Batch origin
      const pickupContainer = await this.productPickupManager.startPickup({
        manager,
        oid,
        voucherId: purchaseOrderId,
        contactId: distributorId,
        movementType: MovementType.PurchaseOrder,
        isRefund: 1,
        time,
        allowNegativeQuantity: false,
        voucherProductPickupList: purchaseOrderItemOriginList.map((i) => {
          return {
            pickupStrategy: PickupStrategy.RequireBatchSelection,
            expectedPrice: Math.round(i.unitCostPrice / i.unitRate),
            actualPrice: Math.round(i.unitCostPrice / i.unitRate),
            productId: i.productId,
            batchId: i.batchId,
            warehouseIds: JSON.stringify([i.warehouseId]),
            quantity: i.unitQuantity * i.unitRate,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
      })

      return {
        purchaseOrderModified,
        purchaseOrderItemList: purchaseOrderItemOriginMap,
        productModifiedList: pickupContainer.productModifiedList,
        batchModifiedList: pickupContainer.batchModifiedList,
      }
    })

    return transaction
  }
}
