import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, InventoryStrategy, MovementType } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  ReceiptItemManager,
  ReceiptManager,
} from '../../managers'

@Injectable()
export class ReceiptSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager
  ) { }

  async sendProduct(params: { oid: number; userId: number; receiptId: number; time: number }) {
    const { oid, userId, receiptId, time } = params
    const PREFIX = `ReceiptId=${receiptId} ship and payment failed`

    try {
      const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        // === 1. RECEIPT: update ===
        const receipt = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          {
            oid,
            id: receiptId,
            status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Executing] },
          },
          {
            status: ReceiptStatus.Executing,
            deliveryStatus: DeliveryStatus.Delivered,
          }
        )

        // === 4. RECEIPT_ITEMS: query + CALCULATOR ===
        const receiptItemList = await this.receiptItemManager.findManyBy(manager, {
          oid,
          receiptId,
        })
        if (receiptItemList.length === 0) {
          throw new Error(`${PREFIX}: receiptItems.length = 0`)
        }

        const productCalculatorMap: Record<
          string,
          {
            productId: number
            quantitySend: number
            openQuantity: number
            costPrice: number
          }
        > = {}
        const batchCalculatorMap: Record<
          string,
          {
            batchId: number
            productId: number
            warehouseId: number
            distributorId: number
            quantitySend: number
            openQuantity: number
            costPrice: number
            batchCode: string
            expiryDate: number | null
          }
        > = {}
        for (let i = 0; i < receiptItemList.length; i++) {
          const { productId, quantity, costPrice } = receiptItemList[i]
          if (!productCalculatorMap[productId]) {
            productCalculatorMap[productId] = {
              productId,
              quantitySend: 0,
              openQuantity: 0,
              costPrice: 0,
            }
          }
          productCalculatorMap[productId].costPrice = costPrice
          productCalculatorMap[productId].quantitySend += quantity
        }

        for (let i = 0; i < receiptItemList.length; i++) {
          const { batchId, quantity } = receiptItemList[i]
          if (!batchCalculatorMap[batchId]) {
            batchCalculatorMap[batchId] = {
              batchId: receiptItemList[i].batchId,
              productId: receiptItemList[i].productId,
              warehouseId: receiptItemList[i].warehouseId,
              distributorId: receiptItemList[i].distributorId,
              quantitySend: 0,
              openQuantity: 0,
              costPrice: receiptItemList[i].costPrice,
              batchCode: receiptItemList[i].batchCode,
              expiryDate: receiptItemList[i].expiryDate || null,
            }
          }
          batchCalculatorMap[batchId].quantitySend += quantity
        }

        // === 5. PRODUCT: update quantity ===
        const productList = await this.productManager.updateListBy({
          manager,
          condition: { oid, inventoryStrategy: { NOT: InventoryStrategy.NoImpact } },
          compare: ['id'],
          tempList: Object.values(productCalculatorMap).map((i) => {
            return { id: i.productId, quantitySend: i.quantitySend }
          }),
          update: { quantity: (tempName: string) => `"quantity" + ${tempName}."quantitySend"` },
          options: { requireEqualLength: true },
        })
        const productMap = ESArray.arrayToKeyValue(productList, 'id')

        const batchList = await this.batchManager.updateListBy({
          manager,
          condition: { oid },
          compare: ['id', 'productId'],
          tempList: Object.values(batchCalculatorMap).map((i) => {
            return { id: i.batchId, productId: i.productId, quantitySend: i.quantitySend }
          }),
          update: { quantity: (tempName: string) => `"quantity" + ${tempName}."quantitySend"` },
          options: { requireEqualLength: true },
        })
        const batchMap = ESArray.arrayToKeyValue(batchList, 'id')

        // === 6. BATCH: update quantity ===

        // === 7. CALCULATOR: số lượng ban đầu của product và batch ===
        productList.forEach((i) => {
          const productCalculator = productCalculatorMap[i.id]
          productCalculator.openQuantity = i.quantity - productCalculator.quantitySend
        })
        batchList.forEach((i) => {
          const batchCalculator = batchCalculatorMap[i.id]
          batchCalculator.openQuantity = i.quantity - batchCalculator.quantitySend
        })

        // === 8. PRODUCT_MOVEMENT: insert ===
        const productMovementInsertList = receiptItemList.map((ri) => {
          const productCalculator = productCalculatorMap[ri.productId]
          // vẫn có thể productCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Receipt,
            contactId: ri.distributorId,
            voucherId: receiptId,
            voucherProductId: ri.id,
            warehouseId: ri.warehouseId,
            productId: ri.productId,
            batchId: ri.batchId,
            isRefund: 0,
            unitRate: ri.unitRate,
            costPrice: ri.costPrice,
            expectedPrice: ri.costPrice,
            actualPrice: ri.costPrice,
            openQuantity: productCalculator ? productCalculator.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: ri.quantity,
            closeQuantity: productCalculator ? productCalculator.openQuantity + ri.quantity : 0,
            createdAt: time,
          }
          // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          // trường hợp noHasManageQuantity thì bỏ qua
          if (productCalculator) {
            productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          }
          return productMovementInsert
        })
        await this.productMovementManager.insertMany(manager, productMovementInsertList)

        return { receipt, receiptItemList, productList, batchList }
      })
      return transaction
    } catch (error) {
      throw error
    }
  }
}
