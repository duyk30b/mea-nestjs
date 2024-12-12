import { Injectable } from '@nestjs/common'
import { TicketLaboratory } from '../entities'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryRelationType,
  TicketLaboratorySortType,
  TicketLaboratoryUpdateType,
} from '../entities/ticket-laboratory.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

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
