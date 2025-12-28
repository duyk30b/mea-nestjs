import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { TicketPaymentDetail } from '../entities'
import {
  TicketPaymentDetailInsertType,
  TicketPaymentDetailRelationType,
  TicketPaymentDetailSortType,
  TicketPaymentDetailUpdateType,
} from '../entities/ticket-payment-detail.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketPaymentDetailManager extends _PostgreSqlManager<
  TicketPaymentDetail,
  TicketPaymentDetailRelationType,
  TicketPaymentDetailInsertType,
  TicketPaymentDetailUpdateType,
  TicketPaymentDetailSortType
> {
  constructor() {
    super(TicketPaymentDetail)
  }
}

@Injectable()
export class TicketPaymentDetailRepository extends _PostgreSqlRepository<
  TicketPaymentDetail,
  TicketPaymentDetailRelationType,
  TicketPaymentDetailInsertType,
  TicketPaymentDetailUpdateType,
  TicketPaymentDetailSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketPaymentDetail)
    private ticketPaymentDetailRepository: Repository<TicketPaymentDetail>
  ) {
    super(TicketPaymentDetail, ticketPaymentDetailRepository)
  }
}
