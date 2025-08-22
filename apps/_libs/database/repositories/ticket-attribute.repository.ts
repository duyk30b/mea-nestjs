import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketAttribute } from '../entities'
import {
  TicketAttributeInsertType,
  TicketAttributeRelationType,
  TicketAttributeSortType,
  TicketAttributeUpdateType,
} from '../entities/ticket-attribute.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketAttributeManager extends _PostgreSqlManager<
  TicketAttribute,
  TicketAttributeRelationType,
  TicketAttributeInsertType,
  TicketAttributeUpdateType,
  TicketAttributeSortType
> {
  constructor() {
    super(TicketAttribute)
  }
}

@Injectable()
export class TicketAttributeRepository extends _PostgreSqlRepository<
  TicketAttribute,
  TicketAttributeRelationType,
  TicketAttributeInsertType,
  TicketAttributeUpdateType,
  TicketAttributeSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketAttribute)
    private ticketAttributeRepository: Repository<TicketAttribute>
  ) {
    super(TicketAttribute, ticketAttributeRepository)
  }
}
