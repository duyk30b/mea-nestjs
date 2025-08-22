import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../common/dto'
import { DiscountType } from '../common/variable'
import { TicketProcedure } from '../entities'
import {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureSortType,
  TicketProcedureUpdateType,
} from '../entities/ticket-procedure.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

export type TicketProcedureUpdateMoneyType = {
  id: number
  procedureId: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}

@Injectable()
export class TicketProcedureManager extends _PostgreSqlManager<
  TicketProcedure,
  TicketProcedureRelationType,
  TicketProcedureInsertType,
  TicketProcedureUpdateType,
  TicketProcedureSortType
> {
  constructor() {
    super(TicketProcedure)
  }
}

@Injectable()
export class TicketProcedureRepository extends _PostgreSqlRepository<
  TicketProcedure,
  TicketProcedureRelationType,
  TicketProcedureInsertType,
  TicketProcedureUpdateType,
  TicketProcedureSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProcedure)
    private ticketProcedureRepository: Repository<TicketProcedure>
  ) {
    super(TicketProcedure, ticketProcedureRepository)
  }

  async updatePriorityList(params: {
    oid: number
    ticketId: number
    updateData: { id: number; priority: number }[]
  }): Promise<TicketProcedure[]> {
    if (!params.updateData.length) return
    const queryUpdateResult: [any[], number] = await this.manager.query(
      `
      UPDATE "TicketProcedure"
      SET "priority" = temp.priority
      FROM (VALUES `
      + params.updateData
        .map(({ id, priority }) => {
          return `(${id}, ${priority})`
        })
        .join(', ')
      + `   ) AS temp("id", "priority")
      WHERE   "TicketProcedure"."id"  = temp."id" 
          AND "TicketProcedure"."ticketId" = ${params.ticketId} 
          AND "TicketProcedure"."oid" = ${params.oid} 
      RETURNING "TicketProcedure".*; 
      `
    )

    const ticketProcedureList = TicketProcedure.fromRaws(queryUpdateResult[0])
    return ticketProcedureList
  }

  async updateQuantityAndDiscount(params: {
    oid: number
    ticketId: number
    ticketProcedureList: TicketProcedureUpdateMoneyType[]
  }) {
    const { oid, ticketId, ticketProcedureList } = params
    await this.manager.query(
      `
      UPDATE "TicketProcedure" vp
      SET "discountMoney" = v."discountMoney",
          "discountPercent" = v."discountPercent",
          "discountType" = v."discountType",
          "actualPrice" = v."actualPrice"
      FROM (VALUES `
      + ticketProcedureList
        .map((i) => {
          return (
            `(${i.id}, ${ticketId}, ${i.procedureId},`
            + ` ${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
          )
        })
        .join(', ')
      + `   ) AS v("id", "ticketId", "procedureId", 
                   "discountMoney", "discountPercent", "discountType", "actualPrice"
                  )
      WHERE vp."id" = v."id" AND vp."ticketId" = v."ticketId"
          AND vp."procedureId" = v."procedureId" AND vp."oid" = ${oid};    
      `
    )
  }

  async topProcedureBestSelling(options: {
    condition: BaseCondition<TicketProcedure>
    limit: number
    orderBy: 'sumActualAmount' | 'sumQuantity'
  }) {
    const { condition, orderBy, limit } = options
    const where = this.getWhereOptions(condition)

    let query = this.manager
      .createQueryBuilder(TicketProcedure, 'ticketProcedure')
      .where(where)
      .groupBy('"ticketProcedure"."procedureId"')
      .select('"ticketProcedure"."procedureId"', 'procedureId')
      .addSelect('SUM("ticketProcedure".quantity)', 'sumQuantity')
      .addSelect(
        'SUM("ticketProcedure".quantity * "ticketProcedure"."actualPrice")',
        'sumActualAmount'
      )
      .limit(limit)

    if (orderBy === 'sumActualAmount') {
      query = query.orderBy('"sumActualAmount"', 'DESC')
    } else if (orderBy === 'sumQuantity') {
      query = query.orderBy('"sumQuantity"', 'DESC')
    }

    const data = await query.getRawMany()

    return data.map((i) => ({
      procedureId: i.procedureId as number,
      sumQuantity: Number(i.sumQuantity),
      sumActualAmount: Number(i.sumActualAmount),
    }))
  }
}
