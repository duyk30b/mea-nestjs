import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm'
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
      customerPayments?: boolean
      visitDiagnosis?: boolean
      visitProductList?: { product?: boolean } | false
      visitProcedureList?: { procedure?: boolean } | false
    }
  ): Promise<Visit | null> {
    let query = this.manager
      .createQueryBuilder(Visit, 'visit')
      .where('visit.id = :id', { id: condition.id })
      .andWhere('visit.oid = :oid', { oid: condition.oid })

    if (relation?.customer) query = query.leftJoinAndSelect('visit.customer', 'customer')
    if (relation?.customerPayments) {
      query = query.leftJoinAndSelect('visit.customerPayments', 'customerPayment')
      query.addOrderBy('customerPayment.id', 'ASC')
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

  async updateItemsMoney(options: {
    oid: number
    visitId: number
    productsMoney?: number
    proceduresMoney?: number
  }) {
    const { oid, visitId, productsMoney, proceduresMoney } = options

    const whereVisit: FindOptionsWhere<Visit> = {
      oid,
      id: visitId,
      visitStatus: VisitStatus.InProgress,
    }
    const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
      visitStatus: VisitStatus.InProgress, // chuyển hết về trạng thái đang khám
      ...(productsMoney == null ? {} : { productsMoney }),
      ...(proceduresMoney == null ? {} : { proceduresMoney }),
      totalMoney: () =>
        `${proceduresMoney == null ? `"proceduresMoney"` : proceduresMoney}` +
        ` + ${productsMoney == null ? `"productsMoney"` : productsMoney}` +
        ` - "discountMoney"`,
      debt: 0,
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
    productsMoney: number
  }) {
    const { oid, visitId, productsMoney } = options

    const whereVisit: FindOptionsWhere<Visit> = {
      oid,
      id: visitId,
      visitStatus: VisitStatus.InProgress,
    }
    const setVisit: { [P in keyof NoExtra<Partial<Visit>>]: Visit[P] | (() => string) } = {
      productsMoney,
      totalMoney: () => `"proceduresMoney" + ${productsMoney} - "discountMoney"`,
      debt: () => `proceduresMoney" + ${productsMoney} - "discountMoney" - paid`,
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
