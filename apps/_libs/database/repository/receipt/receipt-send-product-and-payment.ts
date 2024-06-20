import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, Raw, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
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
export class ReceiptSendProductAndPayment {
  constructor(private dataSource: DataSource) {}

  async sendProductAndPayment(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }) {
    const { oid, receiptId, time, money } = params
    const PREFIX = `ReceiptId=${receiptId} ship and payment failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Prepayment]),
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const setReceipt: { [P in keyof NoExtra<Partial<Receipt>>]: Receipt[P] | (() => string) } = {
        status: () => `CASE 
                          WHEN("totalMoney" - paid = ${money}) THEN ${ReceiptStatus.Success} 
                          ELSE ${ReceiptStatus.Debt}
                      END
                      `,
        debt: () => `"totalMoney" - paid - ${money}`,
        paid: () => `paid + ${money}`,
        startedAt: time,
        endedAt: time,
        year: DTimer.info(time, 7).year,
        month: DTimer.info(time, 7).month + 1,
        date: DTimer.info(time, 7).date,
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set(setReceipt)
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update receipt failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // === 2. RECEIPT_ITEMS: query + CALCULATOR ===
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
          quantitySend: number
          costAmountSend: number
          openQuantity: number
          openCostAmount: number
        }
      > = {}
      for (let i = 0; i < receiptItemsProduct.length; i++) {
        const { productId, quantity, costPrice } = receiptItemsProduct[i]
        if (!productIdMap[productId]) {
          productIdMap[productId] = {
            productId,
            quantitySend: 0,
            costAmountSend: 0,
            openQuantity: 0,
            openCostAmount: 0,
          }
        }
        productIdMap[productId].quantitySend += quantity
        productIdMap[productId].costAmountSend += quantity * costPrice
      }
      const batchIdMap: Record<
        string,
        {
          batchId: number
          productId: number
          quantitySend: number
          openQuantity: number
        }
      > = {}
      for (let i = 0; i < receiptItemsBatch.length; i++) {
        const { batchId, productId, quantity } = receiptItemsBatch[i]
        if (!batchIdMap[batchId]) {
          batchIdMap[batchId] = {
            batchId,
            productId,
            quantitySend: 0,
            openQuantity: 0,
          }
        }
        batchIdMap[batchId].quantitySend += quantity
      }
      let batchList: Batch[] = []
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}

      // === 3. CUSTOMER: increment debt ===
      // Nếu có nợ thì cộng nợ, không thì không cần
      let distributor: Distributor
      if (receipt.debt) {
        const whereDistributor: FindOptionsWhere<Distributor> = { oid, id: receipt.distributorId }
        const distributorUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Distributor)
          .where(whereDistributor)
          .set({
            debt: () => `debt + ${receipt.debt}`,
          })
          .returning('*')
          .execute()
        if (distributorUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: update distributorId = ${receipt.distributorId} failed`)
        }
        distributor = Distributor.fromRaw(distributorUpdateResult.raw[0])
      }

      // === 4. CUSTOMER_PAYMENT: insert ===
      // Trường hợp đơn 0 đồng, 0 nợ thì không cần ghi tanh toán
      if (receipt.debt || receipt.paid) {
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
        const distributorPaymentInsertResult = await manager.insert(
          DistributorPayment,
          distributorPaymentInsert
        )
        const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
        if (!distributorPaymentId) {
          throw new Error(
            `${PREFIX}: Insert DistributorPayment failed:` +
              ` ${JSON.stringify(distributorPaymentInsertResult)}`
          )
        }
      }

      // === 5. PRODUCT: update quantity ===
      if (receiptItemsProduct.length) {
        const productQuantityList = Object.values(productIdMap)
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE    "Product" "product"
          SET       "quantity" = "product"."quantity" + temp."quantitySend",
                    "costAmount" = "product"."costAmount" + temp."costAmountSend"
          FROM (VALUES ` +
            productQuantityList
              .map((i) => {
                return `(${i.productId}, ${i.quantitySend}, ${i.costAmountSend})`
              })
              .join(', ') +
            `   ) AS temp("productId", "quantitySend", "costAmountSend")
          WHERE     "product"."id" = temp."productId" 
                AND "product"."oid" = ${oid}
                AND "product"."hasManageQuantity" = 1 
          RETURNING "product".*;        
          `
        )

        if (productUpdateResult[1] != productQuantityList.length) {
          // * Product chuyển từ có quản lý sang không quản lý => ko update => chấp nhận length khác nhau
          // * Product chuyển từ không quản lý sang có quản lý => ko có trong receiptItems
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
          SET       "quantity" = "batch"."quantity" + temp."quantitySend"
          FROM (VALUES ` +
            batchQuantityList
              .map((i) => {
                return `(${i.batchId}, ${i.quantitySend})`
              })
              .join(', ') +
            `   ) AS temp("batchId", "quantitySend")
          WHERE     "batch"."id" = temp."batchId" AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )
        if (batchUpdateResult[1] != batchQuantityList.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // === 7. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMap[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantitySend
        currentMap.openCostAmount = i.costAmount - currentMap.costAmountSend
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMap[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantitySend
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
          isRefund: 0,
          unitRate: receiptItem.unitRate,
          actualPrice: receiptItem.costPrice,
          expectedPrice: receiptItem.costPrice,
          openQuantity: currentProductMap ? currentProductMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: receiptItem.quantity,
          closeQuantity: currentProductMap
            ? currentProductMap.openQuantity + receiptItem.quantity
            : 0,
          openCostAmount: currentProductMap ? currentProductMap.openCostAmount : 0,
          costAmount: receiptItem.quantity * receiptItem.costPrice,
          closeCostAmount: currentProductMap
            ? currentProductMap.openCostAmount + receiptItem.quantity * receiptItem.costPrice
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
            isRefund: 0,
            unitRate: receiptItem.unitRate,
            actualPrice: receiptItem.costPrice,
            expectedPrice: receiptItem.costPrice,
            openQuantity: currentProductMap ? currentBatchMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: receiptItem.quantity,
            closeQuantity: currentProductMap
              ? currentBatchMap.openQuantity + receiptItem.quantity
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
