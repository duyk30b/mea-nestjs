import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel'
import { ESTimer } from '../../common/helpers/time.helper'
import { Ticket } from '../entities'
import {
  TicketInsertType,
  TicketRelationType,
  TicketSortType,
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

  async nextId(props: { oid: number; createdAt: number }) {
    const { oid, createdAt } = props
    const ticketListToday = await this.findManyBy({
      oid,
      createdAt: {
        GTE: ESTimer.startOfDate(createdAt, 7).getTime(),
        LTE: ESTimer.endOfDate(createdAt, 7).getTime(),
      },
    })
    let maxDailyIndex = 0
    ticketListToday.forEach((i) => {
      if (i.dailyIndex > maxDailyIndex) {
        maxDailyIndex = i.dailyIndex
      }
    })
    const oidText = String(oid).padStart(4, '0')
    const timeText = ESTimer.timeToText(new Date(), 'YYMMDD', 7)
    const indexText = String(maxDailyIndex + 1).padStart(4, '0')

    const id = oidText + timeText + indexText

    return id
  }

  async startTransaction(isolationLevel?: IsolationLevel) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction(isolationLevel)

    const commit = async () => {
      await queryRunner.commitTransaction()
      await queryRunner.release()
    }
    const rollback = async () => {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }
    return {
      manager: queryRunner.manager,
      commit,
      rollback,
    }
  }

  async transaction<T>(
    isolationLevel?: IsolationLevel,
    runInTransaction?: (entityManager: EntityManager) => Promise<T>
  ) {
    const transaction = await this.dataSource.transaction(isolationLevel, runInTransaction)
    return transaction
  }

  async countToday(oid: number) {
    const now = new Date()
    const number = await this.countBy({
      oid,
      createdAt: {
        GTE: ESTimer.startOfDate(now, 7).getTime(),
        LTE: ESTimer.endOfDate(now, 7).getTime(),
      },
    })
    return number
  }

  async refreshLaboratoryMoney(options: { oid: number; ticketId: string }) {
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

  async refreshRadiologyMoney(options: { oid: number; ticketId: string }) {
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

  async changeLaboratoryMoney(options: { oid: number; ticketId: string; laboratoryMoney: number }) {
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
