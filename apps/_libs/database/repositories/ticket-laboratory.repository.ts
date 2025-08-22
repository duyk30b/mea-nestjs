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
import { TicketLaboratory } from '../entities'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryRelationType,
  TicketLaboratorySortType,
  TicketLaboratoryUpdateType,
} from '../entities/ticket-laboratory.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketLaboratoryManager extends _PostgreSqlManager<
  TicketLaboratory,
  TicketLaboratoryRelationType,
  TicketLaboratoryInsertType,
  TicketLaboratoryUpdateType,
  TicketLaboratorySortType
> {
  constructor() {
    super(TicketLaboratory)
  }
}

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
}
