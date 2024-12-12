import { Injectable } from '@nestjs/common'
import { Ticket } from '../entities'
import {
  TicketInsertType,
  TicketRelationType,
  TicketSortType,
  TicketUpdateType,
} from '../entities/ticket.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketManager extends _PostgreSqlManager<
  Ticket,
  TicketRelationType,
  TicketInsertType,
  TicketUpdateType,
  TicketSortType
> {
  constructor() {
    super(Ticket)
  }
}
