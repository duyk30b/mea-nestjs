import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
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

  async updateResultList(options: {
    oid: number,
    ticketId: number,
    startedAt: number
    ticketLaboratoryDtoList: {
      id: number,
      attention: string,
      result: string
    }[]
  }) {
    const { oid, ticketId, startedAt, ticketLaboratoryDtoList } = options
    if (!ticketLaboratoryDtoList.length) return
    const updateResult: [any[], number] = await this.manager.query(
      `
      UPDATE  "TicketLaboratory" AS "tl"
      SET     "attention" = temp.attention,
              "result" = temp.result,
              "startedAt" = ${startedAt},
              "status" = ${TicketLaboratoryStatus.Completed}
      FROM (VALUES `
      + ticketLaboratoryDtoList.map((i) => {
        return `(${i.id}, '${i.attention}', '${i.result}')`
      }).join(', ')
      + `   ) AS temp("id", "attention", "result")
      WHERE   "tl"."id" = temp."id" 
          AND "tl"."oid" = ${oid} 
          AND "tl"."ticketId" = ${ticketId} 
      `
    )

    if (updateResult[1] != ticketLaboratoryDtoList.length) {
      throw new Error(`Update TicketLaboratory failed, affected = ${updateResult[1]}`)
    }
  }
}
