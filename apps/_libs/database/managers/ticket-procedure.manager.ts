import { Injectable } from '@nestjs/common'
import { TicketProcedure } from '../entities'
import {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureSortType,
  TicketProcedureUpdateType,
} from '../entities/ticket-procedure.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketProcedureManager extends _PostgreSqlManager<
  TicketProcedure,
  TicketProcedureRelationType,
  TicketProcedureInsertType,
  TicketProcedureUpdateType,
  TicketProcedureSortType
> {
  constructor() {
    super(TicketProcedure)
  }
}
