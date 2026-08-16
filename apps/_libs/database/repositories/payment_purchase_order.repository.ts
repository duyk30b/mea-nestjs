import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaymentPurchaseOrder } from '../entities'
import {
  PaymentPurchaseOrderInsertType,
  PaymentPurchaseOrderRelationType,
  PaymentPurchaseOrderSortType,
  PaymentPurchaseOrderUpdateType,
} from '../entities/payment_purchase_order.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PaymentPurchaseOrderManager extends _PostgreSqlManager<
  PaymentPurchaseOrder,
  PaymentPurchaseOrderRelationType,
  PaymentPurchaseOrderInsertType,
  PaymentPurchaseOrderUpdateType,
  PaymentPurchaseOrderSortType
> {
  constructor() {
    super(PaymentPurchaseOrder)
  }
}

@Injectable()
export class PaymentPurchaseOrderRepository extends _PostgreSqlRepository<
  PaymentPurchaseOrder,
  PaymentPurchaseOrderRelationType,
  PaymentPurchaseOrderInsertType,
  PaymentPurchaseOrderUpdateType,
  PaymentPurchaseOrderSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PaymentPurchaseOrder)
    private readonly paymentPurchaseOrderRepository: Repository<PaymentPurchaseOrder>
  ) {
    super(PaymentPurchaseOrder, paymentPurchaseOrderRepository)
  }
}
