import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketProcedure } from '../../entities'
import {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureSortType,
  TicketProcedureUpdateType,
} from '../../entities/ticket-procedure.entity'
import { PostgreSqlRepository } from '../postgresql.repository'
import { TicketProcedureUpdateMoneyType } from './ticket-procedure.type'

@Injectable()
export class TicketProcedureRepository extends PostgreSqlRepository<
  TicketProcedure,
  { [P in keyof TicketProcedureSortType]?: 'ASC' | 'DESC' },
  { [P in keyof TicketProcedureRelationType]?: boolean },
  TicketProcedureInsertType,
  TicketProcedureUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProcedure)
    private ticketProcedureRepository: Repository<TicketProcedure>
  ) {
    super(ticketProcedureRepository)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketProcedureInsertType>>(
    data: NoExtra<Partial<TicketProcedureInsertType>, X>[]
  ): Promise<TicketProcedure[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketProcedure.fromRaws(raws)
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
    orderBy: 'sumActualMoney' | 'sumQuantity'
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
        'sumActualMoney'
      )
      .limit(limit)

    if (orderBy === 'sumActualMoney') {
      query = query.orderBy('"sumActualMoney"', 'DESC')
    } else if (orderBy === 'sumQuantity') {
      query = query.orderBy('"sumQuantity"', 'DESC')
    }

    const data = await query.getRawMany()

    return data.map((i) => ({
      procedureId: i.procedureId as number,
      sumQuantity: Number(i.sumQuantity),
      sumActualMoney: Number(i.sumActualMoney),
    }))
  }
}
