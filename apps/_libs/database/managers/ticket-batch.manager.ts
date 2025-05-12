import { Injectable } from '@nestjs/common'
import { TicketBatch } from '../entities'
import {
  TicketBatchInsertType,
  TicketBatchRelationType,
  TicketBatchSortType,
  TicketBatchUpdateType,
} from '../entities/ticket-batch.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketBatchManager extends _PostgreSqlManager<
  TicketBatch,
  TicketBatchRelationType,
  TicketBatchInsertType,
  TicketBatchUpdateType,
  TicketBatchSortType
> {
  constructor() {
    super(TicketBatch)
  }
}
