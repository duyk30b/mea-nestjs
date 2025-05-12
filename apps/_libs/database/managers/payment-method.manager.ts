import { Injectable } from '@nestjs/common'
import { PaymentMethod } from '../entities'
import {
  PaymentMethodInsertType,
  PaymentMethodRelationType,
  PaymentMethodSortType,
  PaymentMethodUpdateType,
} from '../entities/payment-method.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class PaymentMethodManager extends _PostgreSqlManager<
  PaymentMethod,
  PaymentMethodRelationType,
  PaymentMethodInsertType,
  PaymentMethodUpdateType,
  PaymentMethodSortType
> {
  constructor() {
    super(PaymentMethod)
  }
}
