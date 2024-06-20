import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Visit, VisitProduct } from '../../entities'
import { VisitProductInsertType } from '../../entities/visit-product.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitReplaceVisitProductList {
  constructor(private dataSource: DataSource) {}

  async replaceVisitProductList(params: {
    oid: number
    visitId: number
    visitProductListInsert: VisitProductInsertType[]
  }) {
    const { oid, visitId, visitProductListInsert } = params
    const PREFIX = `visitId=${visitId} replaceVisitProductList failed`

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

      // === 2. DELETE OLD ===
      const whereVisitProductDelete: FindOptionsWhere<VisitProduct> = {
        oid,
        visitId,
        isSent: 0,
      }
      await manager.delete(VisitProduct, whereVisitProductDelete)

      // === 3. INSERT NEW ===
      if (visitProductListInsert.length) {
        await manager.insert(VisitProduct, visitProductListInsert)
      }

      // === 4. QUERY NEW ===
      const visitProductList = await manager.find(VisitProduct, {
        relations: { product: true },
        relationLoadStrategy: 'join',
        where: { visitId },
        order: { id: 'ASC' },
      })
      const productsMoney = visitProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmount = visitProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        productsMoney,
        totalCostAmount,
        totalMoney: () => `${productsMoney} + "proceduresMoney" - "discountMoney"`,
        debt: () => `${productsMoney} + "proceduresMoney" - "discountMoney" - "paid"`,
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

      return { visitBasic, visitProductList }
    })

    return transaction
  }
}
