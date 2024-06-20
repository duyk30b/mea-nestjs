import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Visit } from '../../entities'
import VisitProcedure, { VisitProcedureInsertType } from '../../entities/visit-procedure.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitReplaceVisitProcedureList {
  constructor(private dataSource: DataSource) {}

  async replaceVisitProcedureList(params: {
    oid: number
    visitId: number
    visitProcedureListInsert: VisitProcedureInsertType[]
  }) {
    const { oid, visitId, visitProcedureListInsert } = params
    const PREFIX = `visitId=${visitId} replaceVisitProcedureList failed`

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
      const whereVisitProcedureDelete: FindOptionsWhere<VisitProcedure> = {
        oid,
        visitId,
      }
      await manager.delete(VisitProcedure, whereVisitProcedureDelete)

      // === 3. INSERT NEW ===
      if (visitProcedureListInsert.length) {
        await manager.insert(VisitProcedure, visitProcedureListInsert)
      }

      // === 4. QUERY NEW ===
      const visitProcedureList = await manager.find(VisitProcedure, {
        relations: { procedure: true },
        relationLoadStrategy: 'join',
        where: { visitId },
        order: { id: 'ASC' },
      })
      const proceduresMoney = visitProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        proceduresMoney,
        totalMoney: () => `${proceduresMoney} + "productsMoney" - "discountMoney"`,
        debt: () => `${proceduresMoney} + "productsMoney" - "discountMoney" - "paid"`,
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

      return { visitBasic, visitProcedureList }
    })

    return transaction
  }
}
