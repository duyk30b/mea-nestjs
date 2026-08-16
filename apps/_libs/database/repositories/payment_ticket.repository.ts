import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaymentTicket } from '../entities'
import {
  PaymentTicketInsertType,
  PaymentTicketRelationType,
  PaymentTicketSortType,
  PaymentTicketUpdateType,
} from '../entities/payment_ticket.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentTicketManager extends _PostgreSqlManager<
  PaymentTicket,
  PaymentTicketRelationType,
  PaymentTicketInsertType,
  PaymentTicketUpdateType,
  PaymentTicketSortType
> {
  constructor() {
    super(PaymentTicket)
  }
}

@Injectable()
export class PaymentTicketRepository extends _PostgreSqlRepository<
  PaymentTicket,
  PaymentTicketRelationType,
  PaymentTicketInsertType,
  PaymentTicketUpdateType,
  PaymentTicketSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PaymentTicket)
    private readonly paymentTicketRepository: Repository<PaymentTicket>
  ) {
    super(PaymentTicket, paymentTicketRepository)
  }
}
