import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { DiscountType } from '../common/variable'
import { TicketBatch } from '../entities'
import {
  TicketBatchInsertType,
  TicketBatchRelationType,
  TicketBatchSortType,
  TicketBatchUpdateType,
} from '../entities/ticket-batch.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

export type TicketBatchUpdateMoneyType = {
  id: number
  productId: number
  quantity: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}

@Injectable()
export class TicketBatchRepository extends _PostgreSqlRepository<
  TicketBatch,
  TicketBatchRelationType,
  TicketBatchInsertType,
  TicketBatchUpdateType,
  TicketBatchSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketBatch) private ticketBatchRepository: Repository<TicketBatch>
  ) {
    super(TicketBatch, ticketBatchRepository)
  }
}
