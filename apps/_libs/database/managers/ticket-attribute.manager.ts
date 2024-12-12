import { Injectable } from '@nestjs/common'
import { TicketAttribute } from '../entities'
import {
  TicketAttributeInsertType,
  TicketAttributeRelationType,
  TicketAttributeSortType,
  TicketAttributeUpdateType,
} from '../entities/ticket-attribute.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketAttributeManager extends _PostgreSqlManager<
  TicketAttribute,
  TicketAttributeRelationType,
  TicketAttributeInsertType,
  TicketAttributeUpdateType,
  TicketAttributeSortType
> {
  constructor() {
    super(TicketAttribute)
  }
}
