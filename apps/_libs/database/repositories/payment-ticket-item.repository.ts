import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaymentTicketItem } from '../entities'
import {
  PaymentTicketItemInsertType,
  PaymentTicketItemRelationType,
  PaymentTicketItemSortType,
  PaymentTicketItemUpdateType,
} from '../entities/payment-ticket-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentTicketItemManager extends _PostgreSqlManager<
  PaymentTicketItem,
  PaymentTicketItemRelationType,
  PaymentTicketItemInsertType,
  PaymentTicketItemUpdateType,
  PaymentTicketItemSortType
> {
  constructor() {
    super(PaymentTicketItem)
  }
}

@Injectable()
export class PaymentTicketItemRepository extends _PostgreSqlRepository<
  PaymentTicketItem,
  PaymentTicketItemRelationType,
  PaymentTicketItemInsertType,
  PaymentTicketItemUpdateType,
  PaymentTicketItemSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PaymentTicketItem)
    private readonly paymentTicketItemRepository: Repository<PaymentTicketItem>
  ) {
    super(PaymentTicketItem, paymentTicketItemRepository)
  }
}
