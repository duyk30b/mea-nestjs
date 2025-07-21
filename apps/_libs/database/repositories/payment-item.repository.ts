import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaymentItem } from '../entities'
import {
  PaymentItemInsertType,
  PaymentItemRelationType,
  PaymentItemSortType,
  PaymentItemUpdateType,
} from '../entities/payment-item.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentItemManager extends _PostgreSqlManager<
  PaymentItem,
  PaymentItemRelationType,
  PaymentItemInsertType,
  PaymentItemUpdateType,
  PaymentItemSortType
> {
  constructor() {
    super(PaymentItem)
  }
}

@Injectable()
export class PaymentItemRepository extends _PostgreSqlRepository<
  PaymentItem,
  PaymentItemRelationType,
  PaymentItemInsertType,
  PaymentItemUpdateType,
  PaymentItemSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PaymentItem)
    private readonly paymentItemRepository: Repository<PaymentItem>
  ) {
    super(PaymentItem, paymentItemRepository)
  }
}
