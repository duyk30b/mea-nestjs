import { ESArray } from '@libs/common/helpers'
import { PurchaseOrderItem } from '@libs/database/entities'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { PurchaseOrderItemRepository, PurchaseOrderRepository } from '../../repositories'
import { ProductPutawayManager } from '../product/product-putaway.manager'

export type ReceiveProductExecuteType = {
  purchaseOrderItemId: string
  quantityExecute: number
}

@Injectable()
export class PurchaseOrderReceiveProductOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private productPutawayManager: ProductPutawayManager
  ) {}

  async startReceive(
    props: {
      oid: number
      purchaseOrderId: string
      time: number
    } & (
      | { receiveType: 'ALL' }
      | {
          receiveType: 'PARTIAL'
          receiveList: ReceiveProductExecuteType[]
        }
    )
  ) {
    const { oid, purchaseOrderId, time, receiveType } = props
    const PREFIX = `PurchaseOrderId=${purchaseOrderId} receive failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: initData ===
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: {
            IN: [
              PurchaseOrderStatus.Draft,
              PurchaseOrderStatus.Schedule,
              PurchaseOrderStatus.Executing,
            ],
          },
        },
        {
          status: PurchaseOrderStatus.Executing,
          deliveryStatus: receiveType === 'ALL' ? DeliveryStatus.Delivered : DeliveryStatus.Partial,
          updatedAt: Date.now(),
        }
      )
      const { distributorId } = purchaseOrderModified

      let executeList: ReceiveProductExecuteType[] = []
      let purchaseOrderItemActionList: PurchaseOrderItem[] = []
      if (receiveType === 'ALL') {
        purchaseOrderItemActionList = await this.purchaseOrderItemRepository.managerFindManyBy(
          manager,
          { oid, purchaseOrderId }
        )
        purchaseOrderItemActionList = purchaseOrderItemActionList.filter((i) => {
          return i.quantity > i.quantityCompleted
        })
        executeList = purchaseOrderItemActionList.map((i) => {
          return { purchaseOrderItemId: i.id, quantityExecute: i.quantity - i.quantityCompleted }
        })
      } else if (receiveType === 'PARTIAL') {
        executeList = props.receiveList
        const purchaseOrderItemIdList = executeList.map((i) => i.purchaseOrderItemId)
        purchaseOrderItemActionList = await this.purchaseOrderItemRepository.managerFindManyBy(
          manager,
          { oid, purchaseOrderId, id: { IN: purchaseOrderItemIdList } }
        )
      }

      if (purchaseOrderItemActionList.length === 0) {
        throw new Error(`${PREFIX}: executeList is empty`)
      }

      // === 2. Start Putaway Product and Batch ===
      const executeMap = ESArray.arrayToKeyValue(executeList, 'purchaseOrderItemId')
      const putawayContainer = await this.productPutawayManager.startPutaway(
        {
          manager,
          oid,
          voucherId: purchaseOrderId,
          contactId: distributorId,
          time,
          movementType: MovementType.PurchaseOrder,
          isRefund: 0,
          voucherBatchPutawayList: purchaseOrderItemActionList.map((i) => {
            const executeItem = executeMap[i.id]
            return {
              voucherProductId: i.id,
              voucherBatchId: '0',
              warehouseId: i.warehouseId,
              productId: i.productId,
              batchId: i.batchId,
              costAmount: Math.round((executeItem.quantityExecute * i.unitCostPrice) / i.unitRate),
              quantity: executeItem.quantityExecute,
              expectedPrice: Math.round(i.unitCostPrice / i.unitRate),
              actualPrice: Math.round(i.unitCostPrice / i.unitRate),
              productUpdateInfo: {
                productId: i.productId,
                costPrice: Math.round(i.unitCostPrice / i.unitRate),
                retailPrice: Math.round(i.unitListPrice / i.unitRate),
              },
              batchUpdateInfo: {
                batchId: i.batchId,
                warehouseId: i.warehouseId,
                distributorId,
                lotNumber: i.lotNumber,
                expiryDate: i.expiryDate,
                costPrice: Math.round(i.unitCostPrice / i.unitRate),
              },
            }
          }),
        },
        { updateInfo: true }
      )

      // === 3. Update PurchaseOrderItem ===
      let purchaseOrderItemModifiedList = await this.purchaseOrderItemRepository.managerBulkUpdate({
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
          quantityCompleted: () => `"quantityCompleted" + "quantityExecute" `,
        },
        options: { requireEqualLength: true },
      })

      // === 4. Update Information Product and Batch ===

      // 5. Calculator DeliveryStatus for PurchaseOrder
      if (receiveType !== 'ALL') {
        const calculatorResult = await this.purchaseOrderItemRepository.calculatorDeliveryStatus({
          manager,
          oid,
          purchaseOrderId,
        })
        purchaseOrderItemModifiedList = calculatorResult.purchaseOrderItemAll
        await this.purchaseOrderRepository.managerUpdateOne(
          manager,
          { oid, id: purchaseOrderId },
          { deliveryStatus: calculatorResult.deliveryStatus }
        )
      }

      return {
        purchaseOrderModified,
        purchaseOrderItemModifiedAll: purchaseOrderItemModifiedList,
        productModifiedList: putawayContainer.productModifiedList,
        batchModifiedList: putawayContainer.batchModifiedList,
      }
    })
    return transaction
  }
}
