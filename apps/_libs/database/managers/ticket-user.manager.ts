import { Injectable } from '@nestjs/common'
import { TicketUser } from '../entities'
import {
  TicketUserInsertType,
  TicketUserRelationType,
  TicketUserSortType,
  TicketUserUpdateType,
} from '../entities/ticket-user.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketUserManager extends _PostgreSqlManager<
  TicketUser,
  TicketUserRelationType,
  TicketUserInsertType,
  TicketUserUpdateType,
  TicketUserSortType
> {
  constructor() {
    super(TicketUser)
  }
}
