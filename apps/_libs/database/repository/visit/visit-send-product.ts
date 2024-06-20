import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, InsertResult, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VoucherType } from '../../common/variable'
import { Batch, Product, Visit, VisitProduct } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import ProductMovement, { ProductMovementInsertType } from '../../entities/product-movement.entity'
import VisitBatch, { VisitBatchInsertType } from '../../entities/visit-batch.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitSendProduct {
  constructor(private dataSource: DataSource) {}

  async sendProductList(params: {
    oid: number
    visitId: number
    time: number
    visitProductSendList: {
      visitProductId: number
      productId: number
      quantitySend: number
      hasManageQuantity: 0 | 1
      hasManageBatches: 0 | 1
    }[]
    visitBatchSendList: {
      visitProductId: number
      productId: number
      batchId: number
      quantitySend: number
    }[]
  }) {
    const { oid, visitId, time, visitProductSendList, visitBatchSendList } = params
    const PREFIX = `VisitId = ${visitId}, Send Product failed`

    if (!visitProductSendList.length) {
      throw new Error(`${PREFIX}: visitProductSendList.length = 0`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE STATUS for VISIT ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: VisitStatus.InProgress,
      }
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        isSent: 1,
      }
      const visitUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Visit)
        .where(whereVisit)
        .set(setVisit)
        .returning('*')
        .execute()
      if (visitUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Visit, affected = ${visitUpdateResult.affected}`)
      }
      const visit = Visit.fromRaw(visitUpdateResult.raw[0])

      // === 2. UPDATE for VISIT_PRODUCT ===
      const visitProductUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE "VisitProduct" vp
        SET "isSent" = 1
        FROM (VALUES ` +
          visitProductSendList
            .map((i) => `(${i.visitProductId}, ${i.productId}, ${i.quantitySend})`)
            .join(', ') +
          `   ) AS temp("visitProductId", "productId", "quantitySend")
        WHERE   vp."oid" = ${oid} 
            AND vp."visitId" = ${visitId}
            AND vp."id" = temp."visitProductId" 
            AND vp."isSent" = 0
            AND vp."productId" = temp."productId" 
            AND vp."quantity" = temp."quantitySend"
        RETURNING vp.*;    
        `
      )
      if (visitProductUpdateResult[0].length != visitProductSendList.length) {
        throw new Error(`${PREFIX}: Update VisitProduct, affected = ${visitProductUpdateResult[1]}`)
      }
      const visitProductList = VisitProduct.fromRaws(visitProductUpdateResult[0])
      const visitProductMap = arrayToKeyValue(visitProductList, 'id')

      // 3. === CREATE: VISIT_BATCH ===
      let visitBatchList: VisitBatch[] = []
      const visitBatchListDraft: VisitBatchInsertType[] = visitBatchSendList.map((i) => {
        const visitBatchDraft: VisitBatchInsertType = {
          oid,
          visitId,
          visitProductId: i.visitProductId,
          productId: i.productId,
          batchId: i.batchId,
          quantity: i.quantitySend,
        }
        return visitBatchDraft
      })
      if (visitBatchListDraft.length) {
        const visitBatchInsertResult: InsertResult = await manager
          .createQueryBuilder()
          .insert()
          .into(VisitBatch)
          .values(visitBatchListDraft)
          .returning('*')
          .execute()
        visitBatchList = VisitBatch.fromRaws(visitBatchInsertResult.raw)
      }

      // 4. === CALCULATOR: số lượng lấy của product và batch ===
      const productIdMapValue: Record<
        string,
        {
          quantitySend: number
          costAmountSend: number
          openQuantity: number
          openCostAmount: number
        }
      > = {}
      const batchIdMapValue: Record<string, { quantitySend: number; openQuantity: number }> = {}
      for (let i = 0; i < visitProductSendList.length; i++) {
        if (!visitProductSendList[i].hasManageQuantity) continue
        const { productId, visitProductId } = visitProductSendList[i]
        const { quantity, costAmount } = visitProductMap[visitProductId]

        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantitySend: 0,
            costAmountSend: 0,
            openQuantity: 0,
            openCostAmount: 0,
          }
        }
        productIdMapValue[productId].quantitySend += quantity
        productIdMapValue[productId].costAmountSend += costAmount
      }

      for (let i = 0; i < visitBatchSendList.length; i++) {
        const { batchId, quantitySend } = visitBatchSendList[i]

        if (!batchIdMapValue[batchId]) {
          batchIdMapValue[batchId] = { quantitySend: 0, openQuantity: 0 }
        }
        batchIdMapValue[batchId].quantitySend += quantitySend
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      const productIdEntriesValue = Object.entries(productIdMapValue)
      if (productIdEntriesValue.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity" = "product"."quantity" - temp."quantitySend",
              "costAmount" = "product"."costAmount" - temp."costAmountSend"
          FROM (VALUES ` +
            productIdEntriesValue
              .map(([productId, value]) => {
                return `(${productId}, ${value.quantitySend}, ${value.costAmountSend})`
              })
              .join(', ') +
            `   ) AS temp("productId", "quantitySend", "costAmountSend")
          WHERE   "product"."id" = temp."productId" 
              AND "product"."oid" = ${oid} 
              AND "product"."hasManageQuantity" = 1 
              AND "product"."quantity" >= temp."quantitySend"    
          RETURNING "product".*;   
          `
        )
        if (productUpdateResult[1] != productIdEntriesValue.length) {
          throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
        }
        productList = Product.fromRaws(productUpdateResult[0])
      }
      const productMap = arrayToKeyValue(productList, 'id')

      // 6. === UPDATE for BATCH ===
      let batchList: Batch[] = []
      const batchIdEntriesSelect = Object.entries(batchIdMapValue)

      if (batchIdEntriesSelect.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" - temp."quantitySend"
          FROM (VALUES ` +
            batchIdEntriesSelect
              .map(([batchId, value]) => `(${batchId}, ${value.quantitySend})`)
              .join(', ') +
            `   ) AS temp("batchId", "quantitySend")
          WHERE   "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
              AND "batch"."quantity" >= temp."quantitySend"
          RETURNING "batch".*;        
          `
        )
        if (batchUpdateResult[1] != batchIdEntriesSelect.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // 7. === VALIDATE: có thông tin product rồi, giờ validate lại DTO ===
      for (let i = 0; i < visitProductSendList.length; i++) {
        const visitProductDto = visitProductSendList[i]
        const { productId } = visitProductSendList[i]
        const product = productMap[productId]
        if (!product) continue // vì những product không có hasManageQuantity ko được update số lượng nên không có
        if (
          product.hasManageQuantity != visitProductDto.hasManageQuantity ||
          product.hasManageBatches != visitProductDto.hasManageBatches
        ) {
          throw new Error(`${PREFIX}: productId = ${productId} change manage batches`)
        }
      }

      // 8. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend
        currentMap.openCostAmount = i.costAmount + currentMap.costAmountSend
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend
      })

      // 9. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft = visitProductList.map((visitProduct) => {
        const currentMap = productIdMapValue[visitProduct.productId]

        const draft: ProductMovementInsertType = {
          oid,
          productId: visitProduct.productId,
          voucherId: visitId,
          contactId: visit.customerId,
          voucherType: VoucherType.Visit,
          isRefund: 0,
          createdAt: time,
          unitRate: visitProduct.unitRate,
          actualPrice: visitProduct.actualPrice,
          expectedPrice: visitProduct.expectedPrice,
          openQuantity: currentMap ? currentMap.openQuantity : 0,
          quantity: -visitProduct.quantity,
          closeQuantity: currentMap ? currentMap.openQuantity - visitProduct.quantity : 0,
          openCostAmount: currentMap ? currentMap.openCostAmount : 0,
          costAmount: -visitProduct.costAmount,
          closeCostAmount: currentMap ? currentMap.openCostAmount - visitProduct.costAmount : 0,
        }

        // sau khi lấy rồi cần cập nhật currentMap vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        // trường hợp noHasManageQuantity thì bỏ qua
        if (currentMap) {
          currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          currentMap.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy
        }

        return draft
      })
      if (productMovementListDraft.length) {
        await manager.insert(ProductMovement, productMovementListDraft)
      }

      // 10. === CREATE: BATCH_MOVEMENT ===
      const batchMovementsDraft: BatchMovementInsertType[] = []
      visitBatchList.forEach((visitBatch) => {
        const currentMap = batchIdMapValue[visitBatch.batchId]
        const visitProduct = visitProductMap[visitBatch.visitProductId]
        const draft: BatchMovementInsertType = {
          oid,
          productId: visitBatch.productId,
          batchId: visitBatch.batchId,
          voucherId: visitId,
          contactId: visit.customerId,
          voucherType: VoucherType.Visit,
          isRefund: 0,
          unitRate: visitProduct.unitRate,
          openQuantity: currentMap.openQuantity,
          quantity: -visitBatch.quantity,
          closeQuantity: currentMap.openQuantity - visitBatch.quantity,
          actualPrice: visitProduct.actualPrice,
          expectedPrice: visitProduct.actualPrice,
          createdAt: time,
        }
        batchMovementsDraft.push(draft)
        // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
      })
      if (batchMovementsDraft.length) {
        await manager.insert(BatchMovement, batchMovementsDraft)
      }

      return { visitBasic: visit, visitProductList, visitBatchList, productList, batchList }
    })

    return transaction
  }
}
