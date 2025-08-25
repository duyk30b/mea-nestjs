import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
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
}
