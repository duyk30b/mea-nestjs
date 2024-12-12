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
export class ReceiptSendProductAndPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private distributorManager: DistributorManager,
    private distributorPaymentManager: DistributorPaymentManager,
    private receiptItemManager: ReceiptItemManager,
    private productMovementManager: ProductMovementManager,
    private batchMovementManager: BatchMovementManager
  ) { }

  async start(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    const PREFIX = `ReceiptId=${receiptId} ship and payment failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const [receipt] = await this.receiptManager.updateAndReturnEntity(
        manager,
        { oid, id: receiptId, status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Prepayment] } },
        {
          status: () => `CASE 
                              WHEN("totalMoney" - paid = ${money}) THEN ${ReceiptStatus.Success} 
                              ELSE ${ReceiptStatus.Debt}
                          END
                          `,
          debt: () => `"totalMoney" - paid - ${money}`,
          paid: () => `paid + ${money}`,
          startedAt: time,
          endedAt: time,
        }
      )
      if (!receipt) throw new Error(`${PREFIX}: Update Receipt basic failed`)
      if (receipt.paid > receipt.totalMoney) {
        throw new Error(`${PREFIX}:  money = ${money} invalid`)
      }

      // === 3. CUSTOMER + CUSTOMER_PAYMENT ===
      let distributor: Distributor
      // Nếu có nợ thì cộng nợ, không thì không cần
      if (receipt.debt != 0) {
        const distributorUpdatedList = await this.distributorManager.updateAndReturnEntity(
          manager,
          { oid, id: receipt.distributorId },
          { debt: () => `debt + ${receipt.debt}` }
        )
        distributor = distributorUpdatedList[0]
      }

      // Lịch sử thanh toán, Trường hợp đơn 0 đồng, 0 nợ thì không VẪN ghi thanh toán
      if (!distributor) {
        distributor = await manager.findOneBy(Distributor, { oid, id: receipt.distributorId })
      }
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt - receipt.debt

      const distributorPaymentInsert: DistributorPaymentInsertType = {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        paymentType: PaymentType.Close,
        paid: money,
        debit: receipt.debt,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
        note: '',
        description: '',
      }
      await this.distributorPaymentManager.insertOneFullField(manager, distributorPaymentInsert)

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
          lotNumber: string
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
            lotNumber: receiptItemList[i].lotNumber,
            expiryDate: receiptItemList[i].expiryDate || null,
          }
        }
        batchCalculatorMap[batchId].quantitySend += quantity
      }
      let batchList: Batch[] = []
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}

      // === 5. PRODUCT: update quantity ===
      const productCalculatorList = Object.values(productCalculatorMap)
      const productUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE    "Product" "product"
        SET       "quantity" = "product"."quantity" + temp."quantitySend",
                  "costPrice" = temp."costPrice"
        FROM (VALUES `
        + productCalculatorList
          .map((i) => {
            return `(${i.productId}, ${i.quantitySend},
                    ${i.costPrice})`
          })
          .join(', ')
        + `   ) AS temp ("productId", "quantitySend", "costPrice")
        WHERE     "product"."id" = temp."productId" 
              AND "product"."oid" = ${oid}
              AND "product"."hasManageQuantity" = 1
        RETURNING "product".*;        
        `
      )

      if (productUpdateResult[1] != productCalculatorList.length) {
        // * Product chuyển từ có quản lý sang không quản lý => ko update => chấp nhận length khác nhau
        // * Product chuyển từ không quản lý sang có quản lý => ko có trong receiptItems
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
        SET       "quantity" = "batch"."quantity" + temp."quantitySend"
        FROM (VALUES `
        + batchQuantityList.map((i) => `(${i.batchId}, ${i.quantitySend})`).join(', ')
        + `   ) AS temp ( "batchId", "quantitySend" )
        WHERE     "batch"."id" = temp."batchId" AND "batch"."oid" = ${oid}
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
        productCalculator.openQuantity = i.quantity - productCalculator.quantitySend
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity = i.quantity - batchCalculator.quantitySend
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
          contactId: receiptItem.distributorId,
          createdAt: time,
          movementType: MovementType.Receipt,
          isRefund: 0,
          unitRate: receiptItem.unitRate,
          costPrice: receiptItem.costPrice,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: productCalculator ? productCalculator.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: receiptItem.quantity,
          closeQuantity: productCalculator
            ? productCalculator.openQuantity + receiptItem.quantity
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

      // === 8. BATCH_MOVEMENT: insert ===
      const batchMovementInsertList = receiptItemList.map((receiptItem) => {
        const batchCalculator = batchCalculatorMap[receiptItem.batchId]
        // vẫn có thể batchCalculator null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const batchMovementInsert: BatchMovementInsertType = {
          oid,
          warehouseId: receiptItem.warehouseId,
          batchId: receiptItem.batchId,
          productId: receiptItem.productId,
          voucherId: receiptId,
          contactId: receipt.distributorId,
          createdAt: time,
          movementType: MovementType.Receipt,
          isRefund: 0,
          unitRate: receiptItem.unitRate,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: batchCalculator ? batchCalculator.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: receiptItem.quantity,
          closeQuantity: batchCalculator ? batchCalculator.openQuantity + receiptItem.quantity : 0,
        }
        if (batchCalculator) {
          batchCalculator.openQuantity = batchMovementInsert.closeQuantity
        }
        return batchMovementInsert
      })
      await this.batchMovementManager.insertMany(manager, batchMovementInsertList)

      return { receipt, receiptItemList, distributor, productList, batchList }
    })

    return transaction
  }
}
