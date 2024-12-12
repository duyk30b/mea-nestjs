import { Injectable } from '@nestjs/common'
import { CustomerPayment } from '../entities'
import {
  CustomerPaymentInsertType,
  CustomerPaymentRelationType,
  CustomerPaymentSortType,
  CustomerPaymentUpdateType,
} from '../entities/customer-payment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class CustomerPaymentManager extends _PostgreSqlManager<
  CustomerPayment,
  CustomerPaymentRelationType,
  CustomerPaymentInsertType,
  CustomerPaymentUpdateType,
  CustomerPaymentSortType
> {
  constructor() {
    super(CustomerPayment)
  }
}
