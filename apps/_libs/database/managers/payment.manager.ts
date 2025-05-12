import { Injectable } from '@nestjs/common'
import { Payment } from '../entities'
import {
  PaymentInsertType,
  PaymentRelationType,
  PaymentSortType,
  PaymentUpdateType,
} from '../entities/payment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

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
