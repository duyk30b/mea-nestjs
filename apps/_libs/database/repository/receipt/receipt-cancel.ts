import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { PaymentType, ReceiptStatus, VoucherType } from '../../common/variable'
import {
  Batch,
  Distributor,
  DistributorPayment,
  Product,
  ProductMovement,
  Receipt,
  ReceiptItem,
} from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class ReceiptCancel {
  constructor(private dataSource: DataSource) { }

  async cancel(params: {
    oid: number
    receiptId: number
    time: number
    money: number
    description?: string
  }) {
    const { oid, receiptId, money, time } = params
    const PREFIX = `ReceiptId=${receiptId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. RECEIPT: update ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: In([ReceiptStatus.Debt, ReceiptStatus.Success]),
        paid: money, // phải hoàn trả đủ số tiền đã thanh toán
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set({
          status: ReceiptStatus.Cancelled,
          debt: 0,
          paid: 0,
        })
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update receipt failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // === 2. RECEIPT_ITEMS: query + CALCULATOR ===
      const debt = receipt.totalMoney - money
      receipt.receiptItems = await manager.find(ReceiptItem, {
        where: { oid, receiptId },
      })
      if (receipt.receiptItems.length === 0) {
        throw new Error(`${PREFIX}: receiptItems.length = 0`)
      }

      const receiptItemsBatch = receipt.receiptItems.filter((i) => i.batchId != 0)
      const receiptItemsProduct = receipt.receiptItems.filter((i) => i.productId != 0)

      const productIdMap: Record<
        string,
        {
          productId: number
          quantityReturn: number
          costAmountReturn: number
          openQuantity: number
          openCostAmount: number
        }
      > = {}
      for (let i = 0; i < receiptItemsProduct.length; i++) {
        const { productId, quantity, costPrice } = receiptItemsProduct[i]
        if (!productIdMap[productId]) {
          productIdMap[productId] = {
            productId,
            quantityReturn: 0,
            costAmountReturn: 0,
            openQuantity: 0,
            openCostAmount: 0,
          }
        }
        productIdMap[productId].quantityReturn += quantity
        productIdMap[productId].costAmountReturn += quantity * costPrice
      }
      const batchIdMap: Record<
        string,
        {
          batchId: number
          productId: number
          quantityReturn: number
          openQuantity: number
        }
      > = {}
      for (let i = 0; i < receiptItemsBatch.length; i++) {
        const { batchId, productId, quantity } = receiptItemsBatch[i]
        if (!batchIdMap[batchId]) {
          batchIdMap[batchId] = {
            batchId,
            productId,
            quantityReturn: 0,
            openQuantity: 0,
          }
        }
        batchIdMap[batchId].quantityReturn += quantity
      }
      let batchList: Batch[] = []
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}

      // === 3. DISTRIBUTOR: refund debt and query
      // Nếu không có nợ thì không cập nhật nợ
      let distributor: Distributor
      if (debt > 0) {
        const whereDistributor: FindOptionsWhere<Distributor> = { id: receipt.distributorId }
        const distributorUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Distributor)
          .where(whereDistributor)
          .set({
            debt: () => `debt - ${debt}`,
          })
          .returning('*')
          .execute()
        if (distributorUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: DistributorId: ${receipt.distributorId} update failed`)
        }
        distributor = Distributor.fromRaw(distributorUpdateResult.raw[0])
      }

      // === 4. INSERT CUSTOMER_PAYMENT ===
      // Trường hợp đơn 0 đồng mà hoàn trả thì cũng ko cần ghi lịch sử luôn
      if (debt > 0 || money > 0) {
        if (!distributor) {
          distributor = await manager.findOneBy(Distributor, { oid, id: receipt.distributorId })
        }
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributorCloseDebt + debt

        const distributorPaymentInsert: DistributorPaymentInsertType = {
          oid,
          distributorId: receipt.distributorId,
          receiptId,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -money,
          debit: -debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: params.description || '',
        }
        const distributorPaymentInsertResult = await manager.insert(
          DistributorPayment,
          distributorPaymentInsert
        )

        const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
        if (!distributorPaymentId) {
          throw new Error(
            `${PREFIX}: Insert DistributorPayment failed:`
            + ` ${JSON.stringify(distributorPaymentInsertResult)}`
          )
        }
      }

      // === 5. PRODUCT: update quantity ===
      if (receiptItemsProduct.length) {
        const productQuantityList = Object.values(productIdMap)
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE    "Product" "product"
          SET       "quantity" = "product"."quantity" - temp."quantityReturn",
                    "costAmount" = "product"."costAmount" - temp."costAmountReturn"
          FROM (VALUES `
          + productQuantityList
            .map((i) => {
              return `(${i.productId}, ${i.quantityReturn}, ${i.costAmountReturn})`
            })
            .join(', ')
          + `   ) AS temp("productId", "quantityReturn", "costAmountReturn")
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
      }

      // === 6. BATCH: update quantity ===
      if (receiptItemsBatch.length) {
        // product nào không cập nhật số lượng nữa thì cũng không cập nhật batch luôn
        const batchQuantityList = Object.values(batchIdMap).filter((i) => productMap[i.productId])
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE    "Batch" "batch"
          SET       "quantity" = "batch"."quantity" - temp."quantityReturn"
          FROM (VALUES `
          + batchQuantityList
            .map((i) => {
              return `(${i.batchId}, ${i.quantityReturn})`
            })
            .join(', ')
          + `   ) AS temp("batchId", "quantityReturn")
          WHERE     "batch"."id" = temp."batchId" AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )
        if (batchUpdateResult[1] != batchQuantityList.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])

        // Nếu số lượng lô hàng bị quay về 0, thì cần phải tính lại HSD cho sản phẩm gốc
        const batchZeroQuantityList = batchList.filter((i) => i.quantity === 0)
        if (batchZeroQuantityList.length) {
          const productReCalculatorIds = batchZeroQuantityList.map((i) => i.productId)
          const productReCalculatorResult: [any[], number] = await manager.query(`
              UPDATE "Product" product
              SET "expiryDate" = (
                  SELECT MIN("expiryDate")
                  FROM "Batch" batch
                  WHERE   batch."productId" = product.id
                      AND batch."expiryDate" IS NOT NULL
                      AND batch."quantity" <> 0
              )
              WHERE product."hasManageBatches" = 1
                  AND "product"."id" IN (${productReCalculatorIds.toString()})
              RETURNING "product".*;  
            `)
          const productReCalculatorList = Product.fromRaws(productReCalculatorResult[0])
          for (let i = 0; i < productList.length; i++) {
            const productId = productList[i].id
            const productReCalculatorFind = productReCalculatorList.find((i) => i.id === productId)
            if (productReCalculatorFind) {
              productList[i] = productReCalculatorFind
            }
          }
        }
      }

      // === 7. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMap[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantityReturn
        currentMap.openCostAmount = i.costAmount + currentMap.costAmountReturn
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMap[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantityReturn
      })

      // === 8. PRODUCT_MOVEMENT: insert ===
      const productMovementsDraft: ProductMovementInsertType[] = []

      receiptItemsProduct.forEach((receiptItem) => {
        const currentProductMap = productIdMap[receiptItem.productId]
        // vẫn có thể currentProductMap null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const draft: ProductMovementInsertType = {
          oid,
          productId: receiptItem.productId,
          voucherId: receiptId,
          contactId: receipt.distributorId,
          createdAt: time,
          voucherType: VoucherType.Receipt,
          isRefund: 1,
          unitRate: receiptItem.unitRate,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: currentProductMap ? currentProductMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: -receiptItem.quantity,
          closeQuantity: currentProductMap
            ? currentProductMap.openQuantity - receiptItem.quantity
            : 0,
          openCostAmount: currentProductMap ? currentProductMap.openCostAmount : 0,
          costAmount: -receiptItem.quantity * receiptItem.costPrice,
          closeCostAmount: currentProductMap
            ? currentProductMap.openCostAmount - receiptItem.quantity * receiptItem.costPrice
            : 0,
        }
        productMovementsDraft.push(draft)
        // sau khi lấy rồi cần cập nhật currentProductMap vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        // trường hợp noHasManageQuantity thì bỏ qua
        if (currentProductMap) {
          currentProductMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          currentProductMap.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy
        }
      })
      if (productMovementsDraft.length) {
        await manager.insert(ProductMovement, productMovementsDraft)
      }

      // === 9. BATCH_MOVEMENT: insert ===
      if (receiptItemsBatch.length) {
        const batchMovementsInsert = receiptItemsBatch.map((receiptItem) => {
          const currentProductMap = productIdMap[receiptItem.productId]
          // vẫn có thể currentProductMap null vì Product chuyển từ có quản lý sang không quản lý số lượng
          const currentBatchMap = batchIdMap[receiptItem.batchId]
          const draft: BatchMovementInsertType = {
            oid,
            batchId: receiptItem.batchId,
            productId: receiptItem.productId,
            voucherId: receiptId,
            contactId: receipt.distributorId,
            createdAt: time,
            voucherType: VoucherType.Receipt,
            isRefund: 1,
            unitRate: receiptItem.unitRate,
            actualPrice: receiptItem.costPrice,
            expectedPrice: receiptItem.costPrice,
            openQuantity: currentProductMap ? currentBatchMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: -receiptItem.quantity,
            closeQuantity: currentProductMap
              ? currentBatchMap.openQuantity - receiptItem.quantity
              : 0,
          }
          if (currentProductMap) {
            currentBatchMap.openQuantity = draft.closeQuantity
          }
          return draft
        })
        await manager.insert(BatchMovement, batchMovementsInsert)
      }
      const { receiptItems, ...receiptBasic } = receipt
      return { receiptBasic, receiptItems, distributor, productList, batchList }
    })

    return transaction
  }
}
