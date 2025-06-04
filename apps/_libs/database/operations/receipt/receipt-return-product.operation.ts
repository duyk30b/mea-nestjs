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
        { deliveryStatus: DeliveryStatus.Pending } // receipt
      )

      // === 2. RECEIPT_ITEMS: query + CALCULATOR ===
      const receiptItemList = await this.receiptItemManager.findManyBy(manager, { oid, receiptId })

      const productCalculatorMap: Record<
        string,
        { productId: number; quantityReturn: number; openQuantity: number }
      > = {}
      const batchCalculatorMap: Record<
        string,
        {
          batchId: number
          productId: number
          quantityReturn: number
          costPrice: number
          sumCostAmount: number
        }
      > = {}
      for (let i = 0; i < receiptItemList.length; i++) {
        const { batchId, productId, quantity, costPrice } = receiptItemList[i]
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
            costPrice: 0,
            sumCostAmount: 0,
          }
        }

        productCalculatorMap[productId].quantityReturn += quantity
        batchCalculatorMap[batchId].quantityReturn += quantity
        batchCalculatorMap[batchId].costPrice = costPrice
        batchCalculatorMap[batchId].sumCostAmount += quantity * costPrice
      }

      // === 3. PRODUCT: update quantity ===
      const productList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid, inventoryStrategy: { NOT: InventoryStrategy.NoImpact } },
        compare: ['oid', 'id'],
        tempList: Object.values(productCalculatorMap).map((i) => {
          return { oid, id: i.productId, quantityReturn: i.quantityReturn }
        }),
        update: {
          quantity: (t: string) => `"quantity" - "${t}"."quantityReturn"`,
        },
        options: { requireEqualLength: true },
      })
      const productMap = arrayToKeyValue(productList, 'id')

      // product nào không cập nhật số lượng nữa thì cũng không cập nhật batch luôn
      const batchQuantityList = Object.values(batchCalculatorMap).filter((i) => {
        return !!productMap[i.productId]
      })
      const batchList: Batch[] = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id', 'productId'],
        tempList: Object.values(batchQuantityList).map((i) => {
          return {
            id: i.batchId,
            productId: i.productId,
            quantityReturn: i.quantityReturn,
            costPrice: i.costPrice,
            sumCostAmount: i.sumCostAmount,
          }
        }),
        update: {
          quantity: (t: string, u: string) => `"${u}"."quantity" - "${t}"."quantityReturn"`,
          // chú thích 1 vài trường hợp
          // 1. Nếu hoàn trả gây ra số lượng âm, lưu costAmount âm theo "costPrice của batch"
          // 2. Nếu costAmount cũng ko đủ để trả, mặc dù số lượng đủ, thì fix lại theo "costPrice của batch"
          // 3. Nếu số lượng đủ và costAmount đủ thì trừ bình thường
          costAmount: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."quantity" <= "${t}"."quantityReturn")
                                      THEN ("${u}".quantity - "${t}"."quantityReturn") * "${u}"."costPrice"
                                    WHEN  ("${u}"."costAmount" <= "${t}"."sumCostAmount")
                                      THEN ("${u}".quantity - "${t}"."quantityReturn") * "${u}"."costPrice"
                                    ELSE "${u}"."costAmount" - "${t}"."sumCostAmount"
                                  END`,
        },
        options: { requireEqualLength: true },
      })

      // === 4. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        productCalculator.openQuantity = i.quantity + productCalculator.quantityReturn
      })

      // === 5. PRODUCT_MOVEMENT: insert ===
      const productMovementInsertList = receiptItemList.map((ri) => {
        const productCalculator = productCalculatorMap[ri.productId]
        // vẫn có thể productCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          contactId: receipt.distributorId,
          voucherId: receiptId,
          voucherProductId: ri.id,
          warehouseId: ri.warehouseId,
          productId: ri.productId,
          batchId: ri.batchId,
          createdAt: time,
          movementType: MovementType.Receipt,
          isRefund: 1,
          unitRate: ri.unitRate,
          actualPrice: ri.costPrice,
          expectedPrice: ri.costPrice,
          openQuantity: productCalculator ? productCalculator.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: -ri.quantity,
          costAmount: -ri.costPrice * ri.quantity,
          closeQuantity: productCalculator ? productCalculator.openQuantity - ri.quantity : 0,
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
