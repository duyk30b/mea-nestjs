import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DiscountType } from '../../common/variable'
import { Visit, VisitProcedure, VisitProduct } from '../../entities'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitItemsMoney {
  constructor(private dataSource: DataSource) {}

  async updateItemsMoney(params: {
    oid: number
    visitId: number
    visitProductUpdateList: {
      id: number
      productId: number
      quantity: number
      costAmount: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    visitProcedureUpdateList: {
      id: number
      procedureId: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
  }) {
    const { oid, visitId, visitProductUpdateList, visitProcedureUpdateList } = params
    const PREFIX = `visitId=${visitId} update items quantity and discount failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereVisit: FindOptionsWhere<Visit> = {
        oid,
        id: visitId,
        visitStatus: VisitStatus.InProgress,
      }
      const visitUpdateTime = await manager.update(Visit, whereVisit, {
        updatedAt: Date.now(),
      }) // update tạm để tạo transaction
      if (visitUpdateTime.affected !== 1) {
        throw new Error(`${PREFIX}: Update Visit failed`)
      }

      // === 2. UPDATE PRODUCT_LIST ===
      if (visitProductUpdateList.length) {
        await manager.query(
          `
          UPDATE "VisitProduct" vp
          SET "quantity"        = v."quantity",
              "costAmount"      = v."costAmount",
              "discountMoney"   = v."discountMoney",
              "discountPercent" = v."discountPercent",
              "discountType"    = v."discountType",
              "actualPrice"     = v."actualPrice"
          FROM (VALUES ` +
            visitProductUpdateList
              .map((i) => {
                return (
                  `(${i.id}, ${visitId}, ${i.productId}, ${i.quantity}, ${i.costAmount}, ` +
                  `${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
                )
              })
              .join(', ') +
            `   ) AS v("id", "visitId", "productId", "quantity", "costAmount", 
                       "discountMoney", "discountPercent", "discountType", "actualPrice"
                      )
          WHERE vp."id"           = v."id" 
              AND vp."visitId"    = v."visitId" 
              AND vp."productId"  = v."productId" 
              AND vp."isSent"     = 0 
              AND vp."oid"        = ${oid};    
          `
        )
      }

      // === 3. UPDATE PROCEDURE_LIST ===
      if (visitProcedureUpdateList.length) {
        await manager.query(
          `
          UPDATE "VisitProcedure" vp
          SET "discountMoney"   = v."discountMoney",
              "discountPercent" = v."discountPercent",
              "discountType"    = v."discountType",
              "actualPrice"     = v."actualPrice"
          FROM (VALUES ` +
            visitProcedureUpdateList
              .map((i) => {
                return (
                  `(${i.id}, ${visitId}, ${i.procedureId}, ${i.discountMoney}, ` +
                  ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
                )
              })
              .join(', ') +
            `   ) AS v("id", "visitId", "procedureId", "discountMoney", 
                      "discountPercent", "discountType", "actualPrice"
                      )
          WHERE vp."id"             = v."id" 
              AND vp."visitId"      = v."visitId"
              AND vp."procedureId"  = v."procedureId" 
              AND vp."oid"          = ${oid};    
          `
        )
      }

      // === 4. QUERY NEW ===
      const visitProcedureList = await manager.find(VisitProcedure, {
        relations: { procedure: true },
        relationLoadStrategy: 'join',
        where: { visitId },
        order: { id: 'ASC' },
      })
      const visitProductList = await manager.find(VisitProduct, {
        relations: { product: true },
        relationLoadStrategy: 'join',
        where: { visitId },
        order: { id: 'ASC' },
      })

      const proceduresMoney = visitProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const productsMoney = visitProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmount = visitProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      // 4. UPDATE VISIT: MONEY
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        proceduresMoney,
        productsMoney,
        totalCostAmount,
        totalMoney: () => `${proceduresMoney} + ${productsMoney} - "discountMoney"`,
        debt: () => `${proceduresMoney} + ${productsMoney} - "discountMoney" - "paid"`,
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
      const visitBasic = Visit.fromRaw(visitUpdateResult.raw[0])

      return { visitBasic, visitProcedureList, visitProductList }
    })

    return transaction
  }
}
