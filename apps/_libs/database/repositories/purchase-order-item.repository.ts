import { DeliveryStatus } from '@libs/database/common/variable'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PurchaseOrderItem } from '../entities'
import {
  PurchaseOrderItemInsertType,
  PurchaseOrderItemRelationType,
  PurchaseOrderItemSortType,
  PurchaseOrderItemUpdateType,
} from '../entities/purchase-order-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PurchaseOrderItemRepository extends _PostgreSqlRepository<
  PurchaseOrderItem,
  PurchaseOrderItemRelationType,
  PurchaseOrderItemInsertType,
  PurchaseOrderItemUpdateType,
  PurchaseOrderItemSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>
  ) {
    super(PurchaseOrderItem, purchaseOrderItemRepository)
  }

  async calculatorDeliveryStatus(options: {
    manager: EntityManager
    oid: number
    purchaseOrderId: string
    purchaseOrderItemAll?: PurchaseOrderItem[]
  }) {
    const { manager, oid, purchaseOrderId } = options
    let { purchaseOrderItemAll } = options
    if (!purchaseOrderItemAll) {
      purchaseOrderItemAll = await this.managerFindManyBy(manager, { oid, purchaseOrderId })
    }

    let deliveryStatus = DeliveryStatus.Delivered
    if (!purchaseOrderItemAll.length) {
      deliveryStatus = DeliveryStatus.Empty
    } else if (purchaseOrderItemAll.every((i) => i.quantity === 0)) {
      deliveryStatus = DeliveryStatus.Empty
    } else if (purchaseOrderItemAll.every((i) => i.quantity === i.quantityCompleted)) {
      deliveryStatus = DeliveryStatus.Delivered
    } else if (purchaseOrderItemAll.every((i) => i.quantityCompleted === 0)) {
      deliveryStatus = DeliveryStatus.Pending
    } else {
      deliveryStatus = DeliveryStatus.Partial
    }

    return { deliveryStatus, purchaseOrderItemAll }
  }
}
