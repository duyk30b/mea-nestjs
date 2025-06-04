import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { MovementType } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { StockCheckStatus } from '../../entities/stock-check.entity'
import {
    BatchManager,
    ProductManager,
    ProductMovementManager,
    StockCheckItemManager,
    StockCheckManager,
} from '../../managers'

@Injectable()
export class StockCheckReconcileOperation {
  constructor(
    private dataSource: DataSource,
    private stockCheckManager: StockCheckManager,
    private stockCheckItemManager: StockCheckItemManager,
    private batchManager: BatchManager,
    private productManager: ProductManager,
    private productMovementManager: ProductMovementManager
  ) { }

  async startReconcile(params: {
    oid: number
    stockCheckId: number
    userId: number
    time: number
  }) {
    const { oid, stockCheckId, userId, time } = params
    const PREFIX = `stockCheckId=${stockCheckId} StockCheckReconcileOperation failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const stockCheck = await this.stockCheckManager.updateOneAndReturnEntity(
        manager,
        { oid, id: stockCheckId, status: StockCheckStatus.Confirmed },
        { status: StockCheckStatus.Balanced, updatedByUserId: userId, updatedAt: time }
      )

      const stockCheckItemList = await this.stockCheckItemManager.findManyBy(manager, {
        oid,
        stockCheckId,
      })
      // Validate
      const duplicatesBatchId = ESArray.checkDuplicate(stockCheckItemList, 'batchId')
      if (duplicatesBatchId.length) {
        const batchIdList = duplicatesBatchId.map((i) => i.value)
        throw new Error(`${PREFIX}: Có trùng lặp batchId = ${batchIdList.join('')} }`)
      }

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        tempList: stockCheckItemList.map((i) => ({
          id: i.batchId,
          quantity: i.actualQuantity,
          costAmount: i.actualCostAmount,
        })),
        compare: ['id'],
        update: ['quantity', 'costAmount'],
        condition: { oid },
      })
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

      const productIdList = stockCheckItemList.map((i) => i.productId)
      const productOriginList = await this.productManager.findManyBy(manager, {
        oid,
        id: { IN: productIdList },
      })
      const productOriginMap = ESArray.arrayToKeyValue(productOriginList, 'id')

      const productModifiedList = await this.productManager.reCalculateQuantityBySumBatchList({
        manager,
        oid,
        productIdList,
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const productCalcMap: Record<string, { productId: number; openQuantity: number }> = {}
      productOriginList.forEach((i) => {
        productCalcMap[i.id] = { productId: i.id, openQuantity: i.quantity }
      })

      // 7. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []

      stockCheckItemList.forEach((scItem) => {
        const productOrigin = productOriginMap[scItem.productId]
        const productModified = productModifiedMap[scItem.productId]
        const batchModified = batchModifiedMap[scItem.batchId]
        const productCalc = productCalcMap[scItem.productId]
        const quantityDifferent = scItem.actualQuantity - scItem.systemQuantity
        const costAmountDifferent = scItem.actualCostAmount - scItem.systemCostAmount

        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.StockCheck,
          contactId: userId,
          voucherId: stockCheckId,
          voucherProductId: scItem.id,
          warehouseId: batchModified.warehouseId,
          productId: scItem.productId,
          batchId: scItem.batchId || 0,
          isRefund: 0,
          openQuantity: productCalc.openQuantity,
          quantity: quantityDifferent,
          closeQuantity: productCalc.openQuantity + quantityDifferent,
          unitRate: 1,
          costAmount: costAmountDifferent,
          expectedPrice: productModified.retailPrice,
          actualPrice: productModified.retailPrice,
          createdAt: time,
        }
        // gán lại số lượng ban đầu vì productMovementInsert đã lấy
        productCalc.openQuantity = productMovementInsert.closeQuantity
        productMovementInsertList.push(productMovementInsert)
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      return { stockCheck }
    })

    return transaction
  }
}
