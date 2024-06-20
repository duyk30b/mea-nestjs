import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VoucherType } from '../../common/variable'
import { Batch, Product, Visit, VisitProduct } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import ProductMovement, { ProductMovementInsertType } from '../../entities/product-movement.entity'
import VisitBatch from '../../entities/visit-batch.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitReturnProduct {
  constructor(private dataSource: DataSource) {}

  async returnProductList(params: {
    oid: number
    visitId: number
    time: number
    visitProductReturnList: {
      visitProductId: number
      productId: number
      quantityReturn: number
      actualPrice: number
      costAmountReturn: number
      hasManageQuantity: 0 | 1
      hasManageBatches: 0 | 1
    }[]
    visitBatchReturnList: {
      visitBatchId: number
      visitProductId: number
      productId: number
      batchId: number
      quantityReturn: number
    }[]
  }) {
    const { oid, visitId, time, visitProductReturnList, visitBatchReturnList } = params
    const PREFIX = `VisitId = ${visitId}, Return Product failed`

    if (!visitProductReturnList.length) {
      throw new Error(`${PREFIX}: visitProductReturnList.length = 0`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT MONEY ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: VisitStatus.InProgress,
      }
      const productsMoneyReturn = visitProductReturnList.reduce((acc, item) => {
        return acc + item.quantityReturn * item.actualPrice
      }, 0)
      const totalCostAmountReturn = visitProductReturnList.reduce((acc, item) => {
        return acc + item.costAmountReturn
      }, 0)
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        productsMoney: () => `"productsMoney" - ${productsMoneyReturn}`,
        totalCostAmount: () => `"totalCostAmount" - ${totalCostAmountReturn}`,
        totalMoney: () => `"totalMoney" - ${productsMoneyReturn}`,
        debt: () => `"debt" - ${productsMoneyReturn}`,
      }
      const visitUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Visit)
        .where(whereVisit)
        .set(setVisit)
        .returning('*')
        .execute()
      if (visitUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Visit failed`)
      }
      const visit = Visit.fromRaw(visitUpdateResult.raw[0])

      // === 2. UPDATE for VISIT_PRODUCT ===
      const visitProductUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE "VisitProduct" vp
        SET "costAmount" = vp."costAmount" - temp."costAmountReturn",
            "quantity"   = vp."quantity" - temp."quantityReturn",
            "isSent"     =  CASE 
                              WHEN(vp."quantity" = temp."quantityReturn") THEN 0 
                              ELSE 1
                            END
        FROM (VALUES ` +
          visitProductReturnList
            .map((i) => {
              return (
                `(${i.visitProductId}, ${i.productId},` +
                ` ${i.quantityReturn}, ${i.actualPrice}, ${i.costAmountReturn})`
              )
            })
            .join(', ') +
          `   ) AS temp("visitProductId", "productId", 
                        "quantityReturn", "actualPrice", "costAmountReturn"
                        )
        WHERE   vp."oid" = ${oid} 
            AND vp."visitId" = ${visitId}
            AND vp."productId" = temp."productId" 
            AND vp."id" = temp."visitProductId" 
            AND vp."isSent" = 1
            AND vp."actualPrice" = temp."actualPrice"
            AND vp."quantity" >= temp."quantityReturn"
        RETURNING vp.*;    
        `
      )
      if (visitProductUpdateResult[0].length != visitProductReturnList.length) {
        throw new Error(`${PREFIX}: Update VisitProduct, affected = ${visitProductUpdateResult[1]}`)
      }
      const visitProductList = VisitProduct.fromRaws(visitProductUpdateResult[0])
      const visitProductMap = arrayToKeyValue(visitProductList, 'id')

      // 3. === UPDATE for VISIT_BATCH ===
      let visitBatchList: VisitBatch[] = []
      if (visitBatchReturnList.length) {
        const visitBatchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "VisitBatch" vb
          SET "quantity" = vb."quantity" - temp."quantityReturn"
          FROM (VALUES ` +
            visitBatchReturnList
              .map((i) => {
                return `(${i.visitBatchId}, ${i.visitProductId},${i.batchId} , ${i.quantityReturn})`
              })
              .join(', ') +
            `   ) AS temp("visitBatchId", "visitProductId", "batchId", "quantityReturn")
          WHERE   vb."oid" = ${oid} 
              AND vb."visitId" = ${visitId}
              AND vb."id" = temp."visitBatchId" 
              AND vb."visitProductId" = temp."visitProductId" 
              AND vb."batchId" = temp."batchId" 
              AND vb."quantity" >= temp."quantityReturn"
          RETURNING vb.*;    
          `
        )
        if (visitBatchUpdateResult[0].length != visitBatchReturnList.length) {
          throw new Error(`${PREFIX}: Update VisitBatch, affected = ${visitBatchUpdateResult[1]}`)
        }
        visitBatchList = VisitBatch.fromRaws(visitBatchUpdateResult[0])
      }
      // 4. === CALCULATOR: số lượng RETURN của product và batch ===
      const productIdMapValue: Record<
        string,
        {
          quantityReturn: number
          costAmountReturn: number
          openQuantity: number
          openCostAmount: number
        }
      > = {}
      const batchIdMapValue: Record<string, { quantityReturn: number; openQuantity: number }> = {}
      for (let i = 0; i < visitProductReturnList.length; i++) {
        const { productId, quantityReturn, costAmountReturn } = visitProductReturnList[i]
        if (!visitProductReturnList[i].hasManageQuantity) continue

        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantityReturn: 0,
            costAmountReturn: 0,
            openQuantity: 0,
            openCostAmount: 0,
          }
        }
        productIdMapValue[productId].quantityReturn += quantityReturn
        productIdMapValue[productId].costAmountReturn += costAmountReturn
      }
      for (let i = 0; i < visitBatchReturnList.length; i++) {
        const { batchId, quantityReturn } = visitBatchReturnList[i]

        if (!batchIdMapValue[batchId]) {
          batchIdMapValue[batchId] = { quantityReturn: 0, openQuantity: 0 }
        }
        batchIdMapValue[batchId].quantityReturn += quantityReturn
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      const productIdEntriesQuantity = Object.entries(productIdMapValue)
      if (productIdEntriesQuantity.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity" = "product"."quantity" + temp."quantityReturn",
              "costAmount" = "product"."costAmount" + temp."costAmountReturn"
          FROM (VALUES ` +
            productIdEntriesQuantity
              .map(([productId, sl]) => {
                return `(${productId}, ${sl.quantityReturn}, ${sl.costAmountReturn})`
              })
              .join(', ') +
            `   ) AS temp("productId", "quantityReturn", "costAmountReturn")
          WHERE   "product"."oid" = ${oid} 
              AND "product"."id" = temp."productId" 
              AND "product"."hasManageQuantity" = 1 
          RETURNING "product".*;   
          `
        )
        if (productUpdateResult[1] != productIdEntriesQuantity.length) {
          throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
        }
        productList = Product.fromRaws(productUpdateResult[0])
      }
      const productMap = arrayToKeyValue(productList, 'id')

      // 6. === UPDATE for BATCH ===
      let batchList: Batch[] = []
      const batchIdEntriesQuantity = Object.entries(batchIdMapValue)

      if (batchIdEntriesQuantity.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" + temp."quantityReturn"
          FROM (VALUES ` +
            batchIdEntriesQuantity
              .map(([batchId, sl]) => `(${batchId}, ${sl.quantityReturn})`)
              .join(', ') +
            `   ) AS temp("batchId", "quantityReturn")
          WHERE   "batch"."oid" = ${oid}
              AND "batch"."id" = temp."batchId" 
          RETURNING "batch".*;        
          `
        )
        if (batchUpdateResult[1] != batchIdEntriesQuantity.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // 7. === VALIDATE: có thông tin product rồi, giờ validate lại DTO ===
      for (let i = 0; i < visitProductReturnList.length; i++) {
        const visitProductReturn = visitProductReturnList[i]
        const { productId } = visitProductReturnList[i]
        const product = productMap[productId]
        if (!product) continue // vì những product không có hasManageQuantity ko được update số lượng nên không có
        if (
          product.hasManageQuantity != visitProductReturn.hasManageQuantity ||
          product.hasManageBatches != visitProductReturn.hasManageBatches
        ) {
          throw new Error(`${PREFIX}: productId = ${productId} change manage batches`)
        }
      }

      // 8. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMapValue[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantityReturn
        currentMap.openCostAmount = i.costAmount - currentMap.costAmountReturn
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantityReturn
      })

      // 9. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft = visitProductList.map((visitProduct) => {
        const currentMap = productIdMapValue[visitProduct.productId]
        const visitProductReturn = visitProductReturnList.find((i) => {
          return i.visitProductId === visitProduct.id
        })
        const draft: ProductMovementInsertType = {
          oid,
          productId: visitProduct.productId,
          voucherId: visitId,
          contactId: visit.customerId,
          voucherType: VoucherType.Visit,
          isRefund: 1,
          createdAt: time,
          unitRate: visitProduct.unitRate,
          actualPrice: visitProduct.actualPrice,
          expectedPrice: visitProduct.expectedPrice,
          openQuantity: currentMap ? currentMap.openQuantity : 0,
          quantity: visitProductReturn.quantityReturn,
          closeQuantity: currentMap
            ? currentMap.openQuantity + visitProductReturn.quantityReturn
            : 0,
          openCostAmount: currentMap ? currentMap.openCostAmount : 0,
          costAmount: visitProductReturn.costAmountReturn,
          closeCostAmount: currentMap
            ? currentMap.openCostAmount + visitProductReturn.costAmountReturn
            : 0,
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
        const visitBatchReturn = visitBatchReturnList.find((i) => {
          return i.visitBatchId === visitBatch.id
        })
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
          quantity: visitBatchReturn.quantityReturn,
          closeQuantity: currentMap.openQuantity + visitBatchReturn.quantityReturn,
          actualPrice: visitProduct.actualPrice,
          expectedPrice: visitProduct.expectedPrice,
          createdAt: time,
        }
        batchMovementsDraft.push(draft)
        // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
      })
      if (batchMovementsDraft.length) {
        await manager.insert(BatchMovement, batchMovementsDraft)
      }

      return { visitBasic: visit, productList, batchList, visitProductList, visitBatchList }
    })

    return transaction
  }
}
