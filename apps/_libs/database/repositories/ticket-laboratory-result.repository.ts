import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketLaboratoryResult } from '../entities'
import {
  TicketLaboratoryResultInsertType,
  TicketLaboratoryResultRelationType,
  TicketLaboratoryResultSortType,
  TicketLaboratoryResultUpdateType,
} from '../entities/ticket-laboratory-result.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketLaboratoryResultManager extends _PostgreSqlManager<
  TicketLaboratoryResult,
  TicketLaboratoryResultRelationType,
  TicketLaboratoryResultInsertType,
  TicketLaboratoryResultUpdateType,
  TicketLaboratoryResultSortType
> {
  constructor() {
    super(TicketLaboratoryResult)
  }
}

@Injectable()
export class TicketLaboratoryResultRepository extends _PostgreSqlRepository<
  TicketLaboratoryResult,
  TicketLaboratoryResultRelationType,
  TicketLaboratoryResultInsertType,
  TicketLaboratoryResultUpdateType,
  TicketLaboratoryResultSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketLaboratoryResult)
    private ticketLaboratoryResultRepository: Repository<TicketLaboratoryResult>
  ) {
    super(TicketLaboratoryResult, ticketLaboratoryResultRepository)
  }

  async updateResultList(options: {
    oid: number
    ticketId: number
    ticketLaboratoryResultDtoList: {
      id: number
      ticketLaboratoryId: number
      laboratoryId: number
      attention: number
      result: string
    }[]
  }) {
    const { oid, ticketId, ticketLaboratoryResultDtoList } = options
    if (!ticketLaboratoryResultDtoList.length) return
    const updateResult: [any[], number] = await this.manager.query(
      `
        UPDATE  "TicketLaboratoryResult"
        SET     "attention" = temp.attention,
                "result" = temp.result
        FROM (VALUES `
      + ticketLaboratoryResultDtoList
        .map((i) => {
          return `(${i.id}, ${i.attention}, '${i.result}')`
        })
        .join(', ')
      + `   ) AS temp("id", "attention", "result")
        WHERE   "TicketLaboratoryResult"."id"       = temp."id" 
            AND "TicketLaboratoryResult"."oid"      = ${oid} 
            AND "TicketLaboratoryResult"."ticketId" = ${ticketId} 
        RETURNING "TicketLaboratoryResult".*
        `
    )
    return TicketLaboratoryResult.fromRaws(updateResult[0])
  }
}
