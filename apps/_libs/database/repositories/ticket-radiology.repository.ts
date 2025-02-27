import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm'
import { TicketRadiology } from '../entities'
import {
  TicketRadiologyInsertType,
  TicketRadiologyRelationType,
  TicketRadiologySortType,
  TicketRadiologyUpdateType,
} from '../entities/ticket-radiology.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRadiologyRepository extends _PostgreSqlRepository<
  TicketRadiology,
  TicketRadiologyRelationType,
  TicketRadiologyInsertType,
  TicketRadiologyUpdateType,
  TicketRadiologySortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketRadiology)
    private ticketRadiologyRepository: Repository<TicketRadiology>
  ) {
    super(TicketRadiology, ticketRadiologyRepository)
  }

  async sumMoney(options: { oid: number; fromTime?: Date; toTime?: Date }) {
    const { oid, fromTime, toTime } = options
    const whereTicket: FindOptionsWhere<TicketRadiology> = {
      oid,
    }
    if (fromTime && toTime) {
      whereTicket.startedAt = Between(fromTime.getTime(), toTime.getTime())
    } else if (fromTime) {
      whereTicket.startedAt = MoreThanOrEqual(fromTime.getTime())
    } else if (toTime) {
      whereTicket.startedAt = LessThan(toTime.getTime())
    }
    const result = await this.manager
      .createQueryBuilder(TicketRadiology, 'ticketRadiology')
      .where(whereTicket)
      .select(['SUM("costPrice") AS "sumCostMoney"', 'SUM("actualPrice") AS "sumActualMoney"'])
      .getRawOne()
    return {
      sumCostMoney: Number(result.sumCostMoney),
      sumActualMoney: Number(result.sumActualMoney),
    }
  }

  async updatePriorityList(params: {
    oid: number
    ticketId: number
    updateData: { id: number; priority: number }[]
  }): Promise<TicketRadiology[]> {
    if (!params.updateData.length) return []
    const queryUpdateResult: [any[], number] = await this.manager.query(
      `
      UPDATE "TicketRadiology"
      SET "priority" = temp.priority
      FROM (VALUES `
      + params.updateData
        .map(({ id, priority }) => {
          return `(${id}, ${priority})`
        })
        .join(', ')
      + `   ) AS temp("id", "priority")
      WHERE   "TicketRadiology"."id"  = temp."id" 
          AND "TicketRadiology"."ticketId" = ${params.ticketId} 
          AND "TicketRadiology"."oid" = ${params.oid} 
      RETURNING "TicketRadiology".*; 
      `
    )

    const ticketRadiologyList = TicketRadiology.fromRaws(queryUpdateResult[0])
    return ticketRadiologyList
  }
}
