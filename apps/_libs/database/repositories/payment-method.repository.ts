import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaymentMethod } from '../entities'
import {
  PaymentMethodInsertType,
  PaymentMethodRelationType,
  PaymentMethodSortType,
  PaymentMethodUpdateType,
} from '../entities/payment-method.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentMethodRepository extends _PostgreSqlRepository<
  PaymentMethod,
  PaymentMethodRelationType,
  PaymentMethodInsertType,
  PaymentMethodUpdateType,
  PaymentMethodSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PaymentMethod) private paymentMethodRepository: Repository<PaymentMethod>
  ) {
    super(PaymentMethod, paymentMethodRepository)
  }
}
