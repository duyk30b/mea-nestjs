import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketProcedureItem } from '../entities'
import {
  TicketProcedureItemInsertType,
  TicketProcedureItemRelationType,
  TicketProcedureItemSortType,
  TicketProcedureItemUpdateType,
} from '../entities/ticket-procedure-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketProcedureItemManager extends _PostgreSqlManager<
  TicketProcedureItem,
  TicketProcedureItemRelationType,
  TicketProcedureItemInsertType,
  TicketProcedureItemUpdateType,
  TicketProcedureItemSortType
> {
  constructor() {
    super(TicketProcedureItem)
  }
}

@Injectable()
export class TicketProcedureItemRepository extends _PostgreSqlRepository<
  TicketProcedureItem,
  TicketProcedureItemRelationType,
  TicketProcedureItemInsertType,
  TicketProcedureItemUpdateType,
  TicketProcedureItemSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProcedureItem)
    private ticketProcedureItemRepository: Repository<TicketProcedureItem>
  ) {
    super(TicketProcedureItem, ticketProcedureItemRepository)
  }
}
