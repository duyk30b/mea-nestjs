import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketRegimen } from '../entities'
import {
  TicketRegimenInsertType,
  TicketRegimenRelationType,
  TicketRegimenSortType,
  TicketRegimenUpdateType,
} from '../entities/ticket-regimen.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRegimenRepository extends _PostgreSqlRepository<
  TicketRegimen,
  TicketRegimenRelationType,
  TicketRegimenInsertType,
  TicketRegimenUpdateType,
  TicketRegimenSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketRegimen)
    private ticketRegimenRepository: Repository<TicketRegimen>
  ) {
    super(TicketRegimen, ticketRegimenRepository)
  }
}
