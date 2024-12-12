import { Injectable } from '@nestjs/common'
import { DistributorPayment } from '../entities'
import {
  DistributorPaymentInsertType,
  DistributorPaymentRelationType,
  DistributorPaymentSortType,
  DistributorPaymentUpdateType,
} from '../entities/distributor-payment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class DistributorPaymentManager extends _PostgreSqlManager<
  DistributorPayment,
  DistributorPaymentRelationType,
  DistributorPaymentInsertType,
  DistributorPaymentUpdateType,
  DistributorPaymentSortType
> {
  constructor() {
    super(DistributorPayment)
  }
}
