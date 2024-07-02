import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, FindOptionsWhere, Repository, UpdateResult } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Visit } from '../../entities'
import {
  VisitInsertType,
  VisitRelationType,
  VisitSortType,
  VisitStatus,
  VisitUpdateType,
} from '../../entities/visit.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class VisitRepository extends PostgreSqlRepository<
  Visit,
  { [P in keyof VisitSortType]?: 'ASC' | 'DESC' },
  { [P in keyof VisitRelationType]?: boolean },
  VisitInsertType,
  VisitUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Visit) private visitRepository: Repository<Visit>
  ) {
    super(visitRepository)
  }

  async queryOne(
    condition: { id: number; oid: number },
    relation?: {
      customer?: boolean
      customerPaymentList?: boolean
      visitDiagnosis?: boolean
      visitProductList?: { product?: boolean; batch?: boolean } | false
      visitProcedureList?: { procedure?: boolean } | false
      visitRadiologyList?: { radiology?: boolean; doctor?: boolean } | false
      visitExpenseList?: boolean
      visitSurchargeList?: boolean
    }
  ): Promise<Visit | null> {
    let query = this.manager
      .createQueryBuilder(Visit, 'visit')
      .where('visit.id = :id', { id: condition.id })
      .andWhere('visit.oid = :oid', { oid: condition.oid })

    if (relation?.customer) query = query.leftJoinAndSelect('visit.customer', 'customer')
    if (relation?.customerPaymentList) {
      query = query.leftJoinAndSelect('visit.customerPaymentList', 'customerPayment')
      query.addOrderBy('customerPayment.id', 'ASC')
    }
    if (relation?.visitExpenseList) {
      query = query.leftJoinAndSelect('visit.visitExpenseList', 'visitExpenseList')
    }
    if (relation?.visitSurchargeList) {
      query = query.leftJoinAndSelect('visit.visitSurchargeList', 'visitSurchargeList')
    }
    if (relation?.visitDiagnosis) {
      query = query.leftJoinAndSelect('visit.visitDiagnosis', 'visitDiagnosis')
    }
    if (relation?.visitProductList) {
      query = query.leftJoinAndSelect('visit.visitProductList', 'visitProduct')
      query.addOrderBy('visitProduct.id', 'ASC')
      if (relation?.visitProductList.product) {
        query = query.leftJoinAndSelect(
          'visitProduct.product',
          'product',
          'visitProduct.productId != 0'
        )
      }
      if (relation?.visitProductList.batch) {
        query = query.leftJoinAndSelect('visitProduct.batch', 'batch', 'visitProduct.batchId != 0')
      }
    }
    if (relation?.visitProcedureList) {
      query = query.leftJoinAndSelect('visit.visitProcedureList', 'visitProcedure')
      query.addOrderBy('visitProcedure.id', 'ASC')
      if (relation?.visitProcedureList?.procedure) {
        query = query.leftJoinAndSelect(
          'visitProcedure.procedure',
          'procedure',
          'visitProcedure.procedureId != 0'
        )
      }
    }

    if (relation?.visitRadiologyList) {
      query = query.leftJoinAndSelect('visit.visitRadiologyList', 'visitRadiology')
      query.addOrderBy('visitRadiology.id', 'ASC')
      if (relation?.visitRadiologyList?.radiology) {
        query = query.leftJoinAndSelect(
          'visitRadiology.radiology',
          'radiology',
          'visitRadiology.radiologyId != 0'
        )
      }
      if (relation?.visitRadiologyList?.doctor) {
        query = query.leftJoinAndSelect(
          'visitRadiology.doctor',
          'doctor',
          'visitRadiology.doctorId != 0'
        )
      }
    }

    const visit = await query.getOne()
    return visit
  }

  async insertOneAndReturnEntity<X extends Partial<VisitInsertType>>(
    data: NoExtra<Partial<VisitInsertType>, X>
  ): Promise<Visit> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Visit.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<VisitUpdateType>>(
    condition: BaseCondition<Visit>,
    data: NoExtra<Partial<VisitUpdateType>, X>
  ): Promise<Visit[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Visit.fromRaws(raws)
  }

  async refreshRadiologyMoney(options: { oid: number; visitId: number }) {
    const { oid, visitId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Visit" "visit" 
        SET     "radiologyMoney"  = "temp"."sumActualPrice",
                "totalMoney"      = "visit"."totalMoney" - "visit"."radiologyMoney" 
                                        + temp."sumActualPrice",
                "debt"            = "visit"."debt" - "visit"."radiologyMoney" 
                                        + temp."sumActualPrice"
        FROM    ( 
                SELECT "visitId", SUM("actualPrice") as "sumActualPrice"
                    FROM "VisitRadiology" 
                    WHERE "visitId" = (${visitId}) AND "oid" = ${oid}
                    GROUP BY "visitId" 
                ) AS "temp" 
        WHERE   "visit"."id" = "temp"."visitId" 
                    AND "visit"."oid" = ${oid}
        RETURNING visit.*
    `)
    return Visit.fromRaws(updateResult[0])
  }

  async updateItemsMoney(options: {
    oid: number
    visitId: number
    productsMoney?: number
    proceduresMoney?: number
    radiologyMoney?: number
  }) {
    const { oid, visitId, productsMoney, proceduresMoney, radiologyMoney } = options

    const whereVisit: FindOptionsWhere<Visit> = {
      oid,
      id: visitId,
      visitStatus: VisitStatus.InProgress,
    }
    const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
      ...(productsMoney == null ? {} : { productsMoney }),
      ...(proceduresMoney == null ? {} : { proceduresMoney }),
      ...(radiologyMoney == null ? {} : { radiologyMoney }),
      totalMoney: () =>
        `${proceduresMoney == null ? `"proceduresMoney"` : proceduresMoney}` +
        ` + ${productsMoney == null ? `"productsMoney"` : productsMoney}` +
        ` + ${radiologyMoney == null ? `"radiologyMoney"` : radiologyMoney}` +
        ` - "discountMoney"`,
      debt: () =>
        `${proceduresMoney == null ? `"proceduresMoney"` : proceduresMoney}` +
        ` + ${productsMoney == null ? `"productsMoney"` : productsMoney}` +
        ` + ${radiologyMoney == null ? `"radiologyMoney"` : radiologyMoney}` +
        ` - "discountMoney" - "paid`,
    }

    const updateResult: UpdateResult = await this.visitRepository
      .createQueryBuilder()
      .update()
      .where(whereVisit)
      .set(setVisit)
      .returning('*')
      .execute()
    return Visit.fromRaws(updateResult.raw)
  }

  async updateProductMoneyWhenReturn(options: {
    oid: number
    visitId: number
    productsMoneyReturn: number
  }) {
    const { oid, visitId, productsMoneyReturn } = options

    const whereVisit: FindOptionsWhere<Visit> = {
      oid,
      id: visitId,
      visitStatus: VisitStatus.InProgress,
    }
    const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
      productsMoney: () => `"productsMoney" - ${productsMoneyReturn}`,
      totalMoney: () => `"totalMoney" - ${productsMoneyReturn}`,
      debt: () => `"debt" - ${productsMoneyReturn}`,
    }

    const updateResult: UpdateResult = await this.visitRepository
      .createQueryBuilder()
      .update()
      .where(whereVisit)
      .set(setVisit)
      .returning('*')
      .execute()
    return Visit.fromRaws(updateResult.raw)
  }
}
