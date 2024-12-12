import { Injectable } from '@nestjs/common'
import { TicketRadiology } from '../entities'
import {
  TicketRadiologyInsertType,
  TicketRadiologyRelationType,
  TicketRadiologySortType,
  TicketRadiologyUpdateType,
} from '../entities/ticket-radiology.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketRadiologyManager extends _PostgreSqlManager<
  TicketRadiology,
  TicketRadiologyRelationType,
  TicketRadiologyInsertType,
  TicketRadiologyUpdateType,
  TicketRadiologySortType
> {
  constructor() {
    super(TicketRadiology)
  }
}
