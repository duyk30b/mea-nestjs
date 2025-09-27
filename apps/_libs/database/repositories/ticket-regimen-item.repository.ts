import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketRegimenItem } from '../entities'
import {
  TicketRegimenItemInsertType,
  TicketRegimenItemRelationType,
  TicketRegimenItemSortType,
  TicketRegimenItemUpdateType,
} from '../entities/ticket-regimen-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRegimenItemManager extends _PostgreSqlManager<
  TicketRegimenItem,
  TicketRegimenItemRelationType,
  TicketRegimenItemInsertType,
  TicketRegimenItemUpdateType,
  TicketRegimenItemSortType
> {
  constructor() {
    super(TicketRegimenItem)
  }
}

@Injectable()
export class TicketRegimenItemRepository extends _PostgreSqlRepository<
  TicketRegimenItem,
  TicketRegimenItemRelationType,
  TicketRegimenItemInsertType,
  TicketRegimenItemUpdateType,
  TicketRegimenItemSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketRegimenItem)
    private ticketRegimenItemRepository: Repository<TicketRegimenItem>
  ) {
    super(TicketRegimenItem, ticketRegimenItemRepository)
  }
}
