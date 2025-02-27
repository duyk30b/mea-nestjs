import { Injectable } from '@nestjs/common'
import { TicketLaboratoryResult } from '../entities'
import {
  TicketLaboratoryResultInsertType,
  TicketLaboratoryResultRelationType,
  TicketLaboratoryResultSortType,
  TicketLaboratoryResultUpdateType,
} from '../entities/ticket-laboratory-result.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketLaboratoryResultManager extends _PostgreSqlManager<
  TicketLaboratoryResult,
  TicketLaboratoryResultRelationType,
  TicketLaboratoryResultInsertType,
  TicketLaboratoryResultUpdateType,
  TicketLaboratoryResultSortType
> {
  constructor() {
    super(TicketLaboratoryResult)
  }
}
