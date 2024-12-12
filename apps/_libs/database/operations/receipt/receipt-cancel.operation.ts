import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { MovementType, PaymentType, ReceiptStatus } from '../../common/variable'
import { Batch, Distributor, Product } from '../../entities'
import { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import {
  BatchMovementManager,
  DistributorManager,
  DistributorPaymentManager,
  ProductMovementManager,
  ReceiptItemManager,
  ReceiptManager,
} from '../../managers'

@Injectable()
export class ReceiptCancelOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private distributorManager: DistributorManager,
    private distributorPaymentManager: DistributorPaymentManager,
    private receiptItemManager: ReceiptItemManager,
    private productMovementManager: ProductMovementManager,
    private batchMovementManager: BatchMovementManager
  ) { }

  async start(params: { oid: number; receiptId: number; time: number; description?: string }) {
    const { oid, receiptId, time } = params
    const PREFIX = `ReceiptId=${receiptId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. RECEIPT: update RECEIPT ===
      const [receiptRoot] = await this.receiptManager.updateAndReturnEntity(
        manager,
        { oid, id: receiptId },
        { endedAt: Date.now() } // for get ROOT and transaction
      )
      if (!receiptRoot) throw new Error(`${PREFIX}: Update Receipt root failed`)

      const [receipt] = await this.receiptManager.updateAndReturnEntity(
        manager,
        { oid, id: receiptId, status: { IN: [ReceiptStatus.Debt, ReceiptStatus.Success] } },
        { status: ReceiptStatus.Cancelled, debt: 0, paid: 0 }
      )
      if (!receipt) throw new Error(`${PREFIX}: Update Receipt basic failed`)

      let distributor: Distributor
      // Trường hợp đơn 0 đồng mà hoàn trả thì cũng ko cần ghi lịch sử luôn
      if (receiptRoot.debt != 0 || receiptRoot.paid != 0) {
        // === 3. DISTRIBUTOR: refund debt --> Nếu không có nợ thì không cập nhật nợ
        if ([ReceiptStatus.Debt].includes(receiptRoot.status)) {
          const distributorUpdatedList = await this.distributorManager.updateAndReturnEntity(
            manager,
            { oid, id: receiptRoot.distributorId },
            { debt: () => `debt - ${receiptRoot.debt}` }
          )
          distributor = distributorUpdatedList[0]
        }
        if (!distributor) {
          distributor = await this.distributorManager.findOneBy(manager, {
            oid,
            id: receiptRoot.distributorId,
          })
        }

        // === 4. INSERT CUSTOMER_PAYMENT ===
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributorCloseDebt + receiptRoot.debt

        const distributorPaymentInsert: DistributorPaymentInsertType = {
          oid,
          distributorId: receiptRoot.distributorId,
          receiptId,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -receiptRoot.paid,
          debit: -receiptRoot.debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: params.description || '',
        }
        await this.distributorPaymentManager.insertOneFullField(
          manager,
          distributorPaymentInsert
        )
      }

      // === 6. RECEIPT_ITEMS: query + CALCULATOR ===
      const receiptItemList = await this.receiptItemManager.findManyBy(manager, {
        oid,
        receiptId,
      })
      if (receiptItemList.length === 0) {
        throw new Error(`${PREFIX}: receiptItemList.length = 0`)
      }

      const productCalculatorMap: Record<
        string,
        {
          productId: number
          quantityReturn: number
          openQuantity: number
        }
      > = {}
      const batchCalculatorMap: Record<
        string,
        {
          batchId: number
          productId: number
          quantityReturn: number
          openQuantity: number
        }
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

      let batchList: Batch[] = []
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}

      // === 5. PRODUCT: update quantity ===
      const productQuantityList = Object.values(productCalculatorMap)
      const productUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE    "Product" "product"
        SET       "quantity" = "product"."quantity" - temp."quantityReturn"
        FROM (VALUES `
        + productQuantityList.map((i) => `(${i.productId}, ${i.quantityReturn})`).join(', ')
        + `   ) AS temp("productId", "quantityReturn")
        WHERE     "product"."id" = temp."productId" 
              AND "product"."oid" = ${oid}
              AND "product"."hasManageQuantity" = 1
        RETURNING "product".*;        
        `
      )
      if (productUpdateResult[1] != productQuantityList.length) {
        // * Product chuyển từ có quản lý sang không quản lý => ko update => chấp nhận length khác nhau
        // * Product chuyển từ không quản lý sang có quản lý => ko update do đã filter từ receiptItem
        // throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
      }
      productList = Product.fromRaws(productUpdateResult[0])
      productMap = arrayToKeyValue(productList, 'id')

      // === 6. BATCH: update quantity ===
      // product nào không cập nhật số lượng nữa thì cũng không cập nhật batch luôn
      const batchQuantityList = Object.values(batchCalculatorMap).filter((i) => {
        return !!productMap[i.productId]
      })
      const batchUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE    "Batch" "batch"
        SET       "quantity" = "batch"."quantity" - temp."quantityReturn"
        FROM (VALUES `
        + batchQuantityList.map((i) => `(${i.batchId}, ${i.quantityReturn})`).join(', ')
        + `   ) AS temp("batchId", "quantityReturn")
        WHERE     "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
        RETURNING "batch".*;        
        `
      )
      if (batchUpdateResult[1] != batchQuantityList.length) {
        throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
      }
      batchList = Batch.fromRaws(batchUpdateResult[0])

      // === 7. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        productCalculator.openQuantity = i.quantity + productCalculator.quantityReturn
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity = i.quantity + batchCalculator.quantityReturn
      })

      // === 8. PRODUCT_MOVEMENT: insert ===
      const productMovementInsertList = receiptItemList.map((receiptItem) => {
        const productCalculator = productCalculatorMap[receiptItem.productId]
        // vẫn có thể productCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          warehouseId: receiptItem.warehouseId,
          productId: receiptItem.productId,
          voucherId: receiptId,
          contactId: receipt.distributorId,
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

      const batchMovementInsertList = receiptItemList.map((receiptItem) => {
        const batchCalculator = productCalculatorMap[receiptItem.productId]
        // vẫn có thể batchCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const currentBatchMap = batchCalculatorMap[receiptItem.batchId]
        const batchMovementInsert: BatchMovementInsertType = {
          oid,
          warehouseId: receiptItem.warehouseId,
          batchId: receiptItem.batchId,
          productId: receiptItem.productId,
          voucherId: receiptId,
          contactId: receipt.distributorId,
          createdAt: time,
          movementType: MovementType.Receipt,
          isRefund: 1,
          unitRate: receiptItem.unitRate,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: batchCalculator ? currentBatchMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: -receiptItem.quantity,
          closeQuantity: batchCalculator
            ? currentBatchMap.openQuantity - receiptItem.quantity
            : 0,
        }
        if (batchCalculator) {
          currentBatchMap.openQuantity = batchMovementInsert.closeQuantity
        }
        return batchMovementInsert
      })

      await this.batchMovementManager.insertMany(manager, batchMovementInsertList)

      return { receipt, receiptItemList, distributor, productList, batchList }
    })

    return transaction
  }
}
