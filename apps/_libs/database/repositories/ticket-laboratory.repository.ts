import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm'
import { TicketLaboratory } from '../entities'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryRelationType,
  TicketLaboratorySortType,
  TicketLaboratoryStatus,
  TicketLaboratoryUpdateType,
} from '../entities/ticket-laboratory.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketLaboratoryRepository extends _PostgreSqlRepository<
  TicketLaboratory,
  TicketLaboratoryRelationType,
  TicketLaboratoryInsertType,
  TicketLaboratoryUpdateType,
  TicketLaboratorySortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketLaboratory)
    private ticketLaboratoryRepository: Repository<TicketLaboratory>
  ) {
    super(TicketLaboratory, ticketLaboratoryRepository)
  }

  async sumMoney(options: { oid: number; fromTime?: Date; toTime?: Date }) {
    const { oid, fromTime, toTime } = options
    const whereTicket: FindOptionsWhere<TicketLaboratory> = {
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
      .createQueryBuilder(TicketLaboratory, 'ticketLaboratory')
      .where(whereTicket)
      .select(['SUM("costPrice") AS "sumCostMoney"', 'SUM("actualPrice") AS "sumActualMoney"'])
      .getRawOne()
    return {
      sumCostMoney: Number(result.sumCostMoney),
      sumActualMoney: Number(result.sumActualMoney),
    }
  }

  async updateResultList(options: {
    oid: number
    ticketId: number
    startedAt: number
    ticketLaboratoryDtoList: {
      id: number
      attention: string
      result: string
    }[]
  }) {
    const { oid, ticketId, startedAt, ticketLaboratoryDtoList } = options
    if (!ticketLaboratoryDtoList.length) return
    const updateResult: [any[], number] = await this.manager.query(
      `
      UPDATE  "TicketLaboratory"
      SET     "attention" = temp.attention,
              "result" = temp.result,
              "startedAt" = ${startedAt},
              "status" = ${TicketLaboratoryStatus.Completed}
      FROM (VALUES `
      + ticketLaboratoryDtoList
        .map((i) => {
          return `(${i.id}, '${i.attention}', '${i.result}')`
        })
        .join(', ')
      + `   ) AS temp("id", "attention", "result")
      WHERE   "TicketLaboratory"."id"       = temp."id" 
          AND "TicketLaboratory"."oid"      = ${oid} 
          AND "TicketLaboratory"."ticketId" = ${ticketId} 
      RETURNING "TicketLaboratory".*
      `
    )
    return TicketLaboratory.fromRaws(updateResult[0])
  }
}
