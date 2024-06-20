import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VisitProcedure } from '../../entities'
import {
  VisitProcedureInsertType,
  VisitProcedureRelationType,
  VisitProcedureSortType,
  VisitProcedureUpdateType,
} from '../../entities/visit-procedure.entity'
import { PostgreSqlRepository } from '../postgresql.repository'
import { VisitProcedureUpdateMoneyType } from './visit-procedure.type'

@Injectable()
export class VisitProcedureRepository extends PostgreSqlRepository<
  VisitProcedure,
  { [P in keyof VisitProcedureSortType]?: 'ASC' | 'DESC' },
  { [P in keyof VisitProcedureRelationType]?: boolean },
  VisitProcedureInsertType,
  VisitProcedureUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(VisitProcedure) private visitProcedureRepository: Repository<VisitProcedure>
  ) {
    super(visitProcedureRepository)
  }

  async insertManyAndReturnEntity<X extends Partial<VisitProcedureInsertType>>(
    data: NoExtra<Partial<VisitProcedureInsertType>, X>[]
  ): Promise<VisitProcedure[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return VisitProcedure.fromRaws(raws)
  }

  async updateQuantityAndDiscount(params: {
    oid: number
    visitId: number
    visitProcedureList: VisitProcedureUpdateMoneyType[]
  }) {
    const { oid, visitId, visitProcedureList } = params
    await this.manager.query(
      `
      UPDATE "VisitProcedure" vp
      SET "discountMoney" = v."discountMoney",
          "discountPercent" = v."discountPercent",
          "discountType" = v."discountType",
          "actualPrice" = v."actualPrice"
      FROM (VALUES ` +
        visitProcedureList
          .map((i) => {
            return (
              `(${i.id}, ${visitId}, ${i.procedureId},` +
              ` ${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
            )
          })
          .join(', ') +
        `   ) AS v("id", "visitId", "procedureId", 
                   "discountMoney", "discountPercent", "discountType", "actualPrice"
                  )
      WHERE vp."id" = v."id" AND vp."visitId" = v."visitId"
          AND vp."procedureId" = v."procedureId" AND vp."oid" = ${oid};    
      `
    )
  }
}
