import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketReception } from '../entities'
import {
  TicketReceptionInsertType,
  TicketReceptionRelationType,
  TicketReceptionSortType,
  TicketReceptionUpdateType,
} from '../entities/ticket-reception.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketReceptionRepository extends _PostgreSqlRepository<
  TicketReception,
  TicketReceptionRelationType,
  TicketReceptionInsertType,
  TicketReceptionUpdateType,
  TicketReceptionSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketReception)
    private ticketReceptionRepository: Repository<TicketReception>
  ) {
    super(TicketReception, ticketReceptionRepository)
  }
}
