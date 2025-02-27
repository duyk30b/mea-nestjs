import { Injectable } from '@nestjs/common'
import { TicketLaboratoryGroup } from '../entities'
import {
  TicketLaboratoryGroupInsertType,
  TicketLaboratoryGroupRelationType,
  TicketLaboratoryGroupSortType,
  TicketLaboratoryGroupUpdateType,
} from '../entities/ticket-laboratory-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketLaboratoryGroupManager extends _PostgreSqlManager<
  TicketLaboratoryGroup,
  TicketLaboratoryGroupRelationType,
  TicketLaboratoryGroupInsertType,
  TicketLaboratoryGroupUpdateType,
  TicketLaboratoryGroupSortType
> {
  constructor() {
    super(TicketLaboratoryGroup)
  }
}
