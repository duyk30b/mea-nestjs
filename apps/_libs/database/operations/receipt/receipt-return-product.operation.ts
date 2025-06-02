import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DeliveryStatus, InventoryStrategy, MovementType } from '../../common/variable'
import { Batch } from '../../entities'
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
export class ReceiptReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager
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
        { deliveryStatus: DeliveryStatus.Pending } // for get ROOT and transaction
      )

      // === 2. RECEIPT_ITEMS: query + CALCULATOR ===
      const receiptItemList = await this.receiptItemManager.findManyBy(manager, { oid, receiptId })

      const productCalculatorMap: Record<
        string,
        { productId: number; quantityReturn: number; openQuantity: number }
      > = {}
      const batchCalculatorMap: Record<
        string,
        { batchId: number; productId: number; quantityReturn: number; openQuantity: number }
      > = {}
      for (let i = 0; i < receiptItemList.length; i++) {
        const { batchId, productId, quantity } = receiptItemList[i]
        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            productId,
            quantityReturn: 0,
            openQuantity: 0,
          }
        }
        if (!batchCalculatorMap[batchId]) {
          batchCalculatorMap[batchId] = {
            batchId,
            productId,
            quantityReturn: 0,
            openQuantity: 0,
          }
        }

        productCalculatorMap[productId].quantityReturn += quantity
        batchCalculatorMap[batchId].quantityReturn += quantity
      }

      // === 3. PRODUCT: update quantity ===
      const productList = await this.productManager.updateListBy({
        manager,
        condition: { oid, inventoryStrategy: { NOT: InventoryStrategy.NoImpact } },
        compare: ['oid', 'id'],
        tempList: Object.values(productCalculatorMap).map((i) => {
          return { oid, id: i.productId, quantityReturn: i.quantityReturn }
        }),
        update: {
          quantity: (tempName: string) => `"quantity" - ${tempName}."quantityReturn"`,
        },
        options: { requireEqualLength: true },
      })
      const productMap = arrayToKeyValue(productList, 'id')

      // product nào không cập nhật số lượng nữa thì cũng không cập nhật batch luôn
      const batchQuantityList = Object.values(batchCalculatorMap).filter((i) => {
        return !!productMap[i.productId]
      })
      const batchList: Batch[] = await this.batchManager.updateListBy({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: Object.values(batchQuantityList).map((i) => {
          return { id: i.batchId, quantityReturn: i.quantityReturn }
        }),
        update: { quantity: (tempName: string) => `"quantity" - ${tempName}."quantityReturn"` },
        options: { requireEqualLength: true },
      })

      // === 4. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        productCalculator.openQuantity = i.quantity + productCalculator.quantityReturn
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity = i.quantity + batchCalculator.quantityReturn
      })

      // === 5. PRODUCT_MOVEMENT: insert ===
      const productMovementInsertList = receiptItemList.map((receiptItem) => {
        const productCalculator = productCalculatorMap[receiptItem.productId]
        // vẫn có thể productCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          contactId: receipt.distributorId,
          voucherId: receiptId,
          voucherProductId: receiptItem.id,
          warehouseId: receiptItem.warehouseId,
          productId: receiptItem.productId,
          batchId: receiptItem.batchId,
          createdAt: time,
          movementType: MovementType.Receipt,
          isRefund: 1,
          unitRate: receiptItem.unitRate,
          costPrice: receiptItem.costPrice,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: productCalculator ? productCalculator.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: -receiptItem.quantity,
          closeQuantity: productCalculator
            ? productCalculator.openQuantity - receiptItem.quantity
            : 0,
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
  }
}
