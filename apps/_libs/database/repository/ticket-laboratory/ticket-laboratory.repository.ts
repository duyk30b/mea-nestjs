import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketLaboratory } from '../../entities'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryRelationType,
  TicketLaboratorySortType,
  TicketLaboratoryStatus,
  TicketLaboratoryUpdateType,
} from '../../entities/ticket-laboratory.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketLaboratoryRepository extends PostgreSqlRepository<
  TicketLaboratory,
  TicketLaboratorySortType,
  TicketLaboratoryRelationType,
  TicketLaboratoryInsertType,
  TicketLaboratoryUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketLaboratory)
    private ticketLaboratoryRepository: Repository<TicketLaboratory>
  ) {
    super(ticketLaboratoryRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketLaboratoryInsertType>(
    data: NoExtra<TicketLaboratoryInsertType, X>
  ): Promise<TicketLaboratory> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketLaboratory.fromRaw(raw)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketLaboratoryInsertType>>(
    data: NoExtra<Partial<TicketLaboratoryInsertType>, X>[]
  ): Promise<TicketLaboratory[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketLaboratory.fromRaws(raws)
  }

  async insertManyFullFieldAndReturnEntity<X extends TicketLaboratoryInsertType>(
    data: NoExtra<TicketLaboratoryInsertType, X>[]
  ): Promise<TicketLaboratory[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketLaboratory.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<TicketLaboratoryUpdateType>>(
    condition: BaseCondition<TicketLaboratory>,
    data: NoExtra<Partial<TicketLaboratoryUpdateType>, X>
  ): Promise<TicketLaboratory[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketLaboratory.fromRaws(raws)
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
