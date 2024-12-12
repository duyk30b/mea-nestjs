import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketUser } from '../entities'
import {
  TicketUserInsertType,
  TicketUserRelationType,
  TicketUserSortType,
  TicketUserUpdateType,
} from '../entities/ticket-user.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketUserRepository extends _PostgreSqlRepository<
  TicketUser,
  TicketUserRelationType,
  TicketUserInsertType,
  TicketUserUpdateType,
  TicketUserSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketUser)
    private ticketUserRepository: Repository<TicketUser>
  ) {
    super(TicketUser, ticketUserRepository)
  }
}
