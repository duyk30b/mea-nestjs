import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, IsNull, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Visit, VisitRadiology } from '../../entities'
import { VisitRadiologyInsertBasicType } from '../../entities/visit-radiology.entity'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class VisitReplaceVisitRadiologyList {
  constructor(private dataSource: DataSource) {}

  async replaceVisitRadiologyList(params: {
    oid: number
    visitId: number
    visitRadiologyListInsert: VisitRadiologyInsertBasicType[]
  }) {
    const { oid, visitId, visitRadiologyListInsert } = params
    const PREFIX = `visitId=${visitId} replaceVisitRadiologyList failed`

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
      const whereVisitRadiologyDelete: FindOptionsWhere<VisitRadiology> = {
        oid,
        visitId,
        startedAt: IsNull(), // chỉ xóa những thằng chưa thực hiện
      }
      await manager.delete(VisitRadiology, whereVisitRadiologyDelete)

      // === 3. INSERT NEW ===
      if (visitRadiologyListInsert.length) {
        await manager.insert(VisitRadiology, visitRadiologyListInsert)
      }

      // === 4. QUERY NEW ===
      const visitRadiologyList = await manager.find(VisitRadiology, {
        relations: { radiology: true, doctor: true },
        relationLoadStrategy: 'join',
        where: { visitId },
        order: { id: 'ASC' },
      })
      const radiologyMoney = visitRadiologyList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
        radiologyMoney,
        totalMoney: () => `"totalMoney" - "radiologyMoney" + ${radiologyMoney}`,
        debt: () => `"debt" - "radiologyMoney" + ${radiologyMoney}`,
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

      return { visitBasic, visitRadiologyList }
    })

    return transaction
  }
}
