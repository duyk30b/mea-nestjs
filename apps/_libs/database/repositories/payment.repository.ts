import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Payment } from '../entities'
import {
  PaymentInsertType,
  PaymentRelationType,
  PaymentSortType,
  PaymentUpdateType,
} from '../entities/payment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentManager extends _PostgreSqlManager<
  Payment,
  PaymentRelationType,
  PaymentInsertType,
  PaymentUpdateType,
  PaymentSortType
> {
  constructor() {
    super(Payment)
  }
}

@Injectable()
export class PaymentRepository extends _PostgreSqlRepository<
  Payment,
  PaymentRelationType,
  PaymentInsertType,
  PaymentUpdateType,
  PaymentSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>
  ) {
    super(Payment, paymentRepository)
  }
}
