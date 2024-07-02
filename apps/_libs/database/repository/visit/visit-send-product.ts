import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VoucherType } from '../../common/variable'
import { Batch, Product, Visit, VisitProduct } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import ProductMovement, { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitSendProduct {
  constructor(private dataSource: DataSource) {}

  async sendProduct(params: { oid: number; visitId: number; time: number; money: number }) {
    const { oid, visitId, time, money } = params
    const PREFIX = `VisitId = ${visitId}, sendProductAndPayment failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE STATUS for VISIT ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: In([VisitStatus.Draft, VisitStatus.InProgress]),
      }
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        isSent: 1,
        visitStatus: VisitStatus.InProgress,
      }
      const visitUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Visit)
        .where(whereVisit)
        .set(setVisit)
        .returning('*')
        .execute()
      if (visitUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Visit failed: visitUpdateResult = ${visitUpdateResult}`)
      }
      const visit = Visit.fromRaw(visitUpdateResult.raw[0])

      // === 2. UPDATE VISIT_PRODUCT ===
      const whereVisitProduct: FindOptionsWhere<VisitProduct> = {
        oid,
        id: visitId,
        isSent: 0,
      }
      const setVisitProduct: {
        [P in keyof NoExtra<Partial<VisitProduct>>]: VisitProduct[P] | (() => string)
      } = {
        isSent: 1,
      }
      const visitProductListUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(VisitProduct)
        .where(whereVisitProduct)
        .set(setVisitProduct)
        .returning('*')
        .execute()
      visit.visitProductList = VisitProduct.fromRaws(visitProductListUpdateResult.raw)

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
      for (let i = 0; i < visit.visitProductList.length; i++) {
        const { productId, batchId, quantity, costAmount } = visit.visitProductList[i]
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

        if (batchId != 0) {
          if (!batchIdMapValue[batchId]) {
            batchIdMapValue[batchId] = { quantitySend: 0, openQuantity: 0 }
          }
          batchIdMapValue[batchId].quantitySend += quantity
        }
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
            RETURNING "product".*;   
          `
        )
        // Kết quả: cho phép số lượng âm, thằng nào không quản lý tồn kho không được update
        productList = Product.fromRaws(productUpdateResult[0])
      }

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
        // Kết quả: "KHÔNG" cho phép số lượng âm
        if (batchUpdateResult[1] != batchIdEntriesSelect.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // 7. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend
        currentMap.openCostAmount = i.costAmount + currentMap.costAmountSend
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft = visit.visitProductList.map((visitProduct) => {
        const currentMap = productIdMapValue[visitProduct.productId]
        // nếu không có currentMap, nghĩa là product đó ko được update, vậy product đó hasManageQuantity = 0

        const draft: ProductMovementInsertType = {
          oid,
          productId: visitProduct.productId,
          voucherId: visitId,
          contactId: visit.customerId,
          voucherType: VoucherType.Clinic,
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

      // 9. === CREATE: BATCH_MOVEMENT ===
      const batchMovementListDraft = visit.visitProductList
        .filter((i) => i.batchId !== 0)
        .map((visitProduct) => {
          const currentMap = batchIdMapValue[visitProduct.batchId]
          if (!currentMap) {
            throw new Error(`${PREFIX}: Not found ${visitProduct.batchId} when create movement`)
          }
          const draft: BatchMovementInsertType = {
            oid,
            productId: visitProduct.productId,
            batchId: visitProduct.batchId,
            voucherId: visitId,
            contactId: visit.customerId,
            voucherType: VoucherType.Clinic,
            isRefund: 0,
            unitRate: visitProduct.unitRate,
            openQuantity: currentMap.openQuantity,
            quantity: -visitProduct.quantity,
            closeQuantity: currentMap.openQuantity - visitProduct.quantity,
            actualPrice: visitProduct.actualPrice,
            expectedPrice: visitProduct.expectedPrice,
            createdAt: time,
          }
          // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy

          return draft
        })
      if (batchMovementListDraft.length) {
        await manager.insert(BatchMovement, batchMovementListDraft)
      }

      return { visitBasic: visit, productList, batchList }
    })
  }
}
