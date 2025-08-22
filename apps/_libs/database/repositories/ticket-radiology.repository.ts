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
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRadiologyManager extends _PostgreSqlManager<
  TicketRadiology,
  TicketRadiologyRelationType,
  TicketRadiologyInsertType,
  TicketRadiologyUpdateType,
  TicketRadiologySortType
> {
  constructor() {
    super(TicketRadiology)
  }
}

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
}
