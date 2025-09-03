import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In, Repository } from 'typeorm'
import { ESTimer } from '../../common/helpers/time.helper'
import {
  Appointment,
  Ticket,
  TicketAttribute,
  TicketBatch,
  TicketExpense,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
  TicketUser,
} from '../entities'
import { TicketProductType } from '../entities/ticket-product.entity'
import {
  TicketInsertType,
  TicketRelationType,
  TicketSortType,
  TicketStatus,
  TicketUpdateType,
} from '../entities/ticket.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketManager extends _PostgreSqlManager<
  Ticket,
  TicketRelationType,
  TicketInsertType,
  TicketUpdateType,
  TicketSortType
> {
  constructor() {
    super(Ticket)
  }
}

@Injectable()
export class TicketRepository extends _PostgreSqlRepository<
  Ticket,
  TicketRelationType,
  TicketInsertType,
  TicketUpdateType,
  TicketSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {
    super(Ticket, ticketRepository)
  }

  async countToday(oid: number) {
    const now = new Date()
    const number = await this.countBy({
      oid,
      registeredAt: {
        GTE: ESTimer.startOfDate(now, 7).getTime(),
        LTE: ESTimer.endOfDate(now, 7).getTime(),
      },
    })
    return number
  }

  async destroy(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereTicket: FindOptionsWhere<Ticket> = {
        id: ticketId,
        oid,
        status: In([TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Cancelled]),
      }
      const ticketDeleteResult = await manager.delete(Ticket, whereTicket)
      if (ticketDeleteResult.affected !== 1) {
        throw new Error(`Destroy Ticket ${ticketId} failed: Status invalid`)
      }
      await manager.delete(Appointment, { oid, fromTicketId: ticketId })
      await manager.delete(TicketAttribute, { oid, ticketId })
      await manager.delete(TicketBatch, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })
      await manager.delete(TicketLaboratory, { oid, ticketId })
      await manager.delete(TicketLaboratoryGroup, { oid, ticketId })
      await manager.delete(TicketLaboratoryResult, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketRadiology, { oid, ticketId })
      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketUser, { oid, ticketId })
    })
  }

  async refreshLaboratoryMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney"   = "temp"."sumLaboratoryActualPrice",
                "itemsActualMoney"  = "ticket"."itemsActualMoney" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "totalMoney"        = "ticket"."totalMoney" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "debt"              = "ticket"."debt" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "profit"            = "ticket"."profit" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumLaboratoryActualPrice"
                    FROM "TicketLaboratory" 
                    WHERE "ticketId" = (${ticketId}) AND "oid" = ${oid}
                    GROUP BY "ticketId" 
                ) AS "temp" 
        WHERE   "ticket"."id" = "temp"."ticketId" 
                    AND "ticket"."oid" = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }

  async refreshRadiologyMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "radiologyMoney"    = "temp"."sumRadiologyActualPrice",
                "itemsActualMoney"  = "ticket"."itemsActualMoney" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "totalMoney"        = "ticket"."totalMoney" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "debt"              = "ticket"."debt" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "profit"            = "ticket"."profit" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumRadiologyActualPrice"
                    FROM "TicketRadiology" 
                    WHERE "ticketId" = (${ticketId}) AND "oid" = ${oid}
                    GROUP BY "ticketId" 
                ) AS "temp" 
        WHERE   "ticket"."id" = "temp"."ticketId" 
                    AND "ticket"."oid" = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }

  async changeLaboratoryMoney(options: { oid: number; ticketId: number; laboratoryMoney: number }) {
    const { oid, ticketId, laboratoryMoney } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney"   = ${laboratoryMoney},
                "itemsActualMoney"  = "itemsActualMoney" - "laboratoryMoney" + ${laboratoryMoney},
                "totalMoney"        = "totalMoney" - "laboratoryMoney" + ${laboratoryMoney},
                "debt"              = "debt" - "laboratoryMoney"  + ${laboratoryMoney},
                "profit"            = "profit" - "laboratoryMoney" + ${laboratoryMoney}
        WHERE   "ticket"."id"       = ${ticketId}
            AND "ticket"."oid"      = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }
}
