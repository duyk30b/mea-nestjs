import { PurchaseOrderItem } from '@libs/database/entities'
import { PurchaseOrderReCalculatorManager } from '@libs/database/operations/purchase-order/purchase_order_re_calculator.manager'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { MovementType, PickupStrategy } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { PurchaseOrderItemRepository, PurchaseOrderRepository } from '../../repositories'
import { ProductPickupManager } from '../product/product-pickup.manager'

export type PurchaseOrderItemReturnType = {
  purchaseOrderItemId: string
  quantityExecute: number
}

@Injectable()
export class PurchaseOrderReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private productPickupManager: ProductPickupManager,
    private purchaseOrderChangeMoneyManager: PurchaseOrderReCalculatorManager
  ) {}

  async returnProduct(
    props: {
      oid: number
      purchaseOrderId: string
      time: number
      returnList?: PurchaseOrderItemReturnType[]
      options?: { keepQuantity?: boolean }
    } & (
      | { returnType: 'ALL' }
      | {
          returnType: 'PARTIAL'
          returnList: PurchaseOrderItemReturnType[]
        }
    )
  ) {
    const { oid, purchaseOrderId, time, returnType } = props
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} return failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. PURCHASE_ORDER: update PURCHASE_ORDER ===
      const purchaseOrderOrigin = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        { oid, id: purchaseOrderId, status: PurchaseOrderStatus.Executing },
        { updatedAt: Date.now() }
      )
      const { distributorId } = purchaseOrderOrigin

      let executeList: PurchaseOrderItemReturnType[] = []
      let purchaseOrderItemOriginList: PurchaseOrderItem[] = []
      if (returnType === 'ALL') {
        purchaseOrderItemOriginList = await this.purchaseOrderItemRepository.managerFindManyBy(
          manager,
          { oid, purchaseOrderId }
        )
        executeList = purchaseOrderItemOriginList.map((i) => {
          return {
            purchaseOrderItemId: i.id,
            quantityExecute: i.quantityCompleted,
          }
        })
      } else if (returnType === 'PARTIAL') {
        executeList = props.returnList || []
        const purchaseOrderItemIdList = executeList.map((i) => i.purchaseOrderItemId)
        purchaseOrderItemOriginList = await this.purchaseOrderItemRepository.managerFindManyBy(
          manager,
          { oid, purchaseOrderId, id: { IN: purchaseOrderItemIdList } }
        )
      }

      executeList = executeList.filter((i) => i.quantityExecute > 0)
      if (!executeList.length) {
        throw new Error(`${PREFIX}: executeList is empty`)
      }

      // === 2. Start Pickup Product and Batch ===
      const executeMap = ESArray.arrayToKeyValue(executeList, 'purchaseOrderItemId')
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
          const executeItem = executeMap[i.id]
          return {
            pickupStrategy: PickupStrategy.RequireBatchSelection,
            expectedPrice: Math.round(i.unitCostPrice / i.unitRate),
            actualPrice: Math.round(i.unitCostPrice / i.unitRate),
            productId: i.productId,
            batchId: i.batchId,
            warehouseIds: JSON.stringify([i.warehouseId]),
            quantity: executeItem.quantityExecute,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
      })

      // === 3. Update PurchaseOrderItem ===
      const purchaseOrderItemModifiedList =
        await this.purchaseOrderItemRepository.managerBulkUpdate({
          manager,
          condition: { oid, purchaseOrderId, distributorId },
          compare: { id: { cast: 'bigint' } },
          tempList: executeList.map((i) => {
            return {
              id: i.purchaseOrderItemId,
              quantityExecute: i.quantityExecute,
            }
          }),
          update: {
            quantityCompleted: () => `"quantityCompleted" - "quantityExecute"`,
            quantity: !props?.options?.keepQuantity
              ? () => `"quantity" - "quantityExecute"`
              : undefined,
          },
          options: { requireEqualLength: true },
        })

      const { purchaseOrderModified, purchaseOrderItemAll } =
        await this.purchaseOrderChangeMoneyManager.startRecalculate({
          manager,
          purchaseOrderId,
          purchaseOrderOrigin,
          oid,
        })

      return {
        purchaseOrderModified,
        purchaseOrderItemModifiedAll: purchaseOrderItemAll,
        productModifiedList: pickupContainer.productModifiedList,
        batchModifiedList: pickupContainer.batchModifiedList,
      }
    })

    return transaction
  }
}
