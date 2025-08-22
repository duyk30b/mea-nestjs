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
export class PurchaseOrderItemManager extends _PostgreSqlManager<
  PurchaseOrderItem,
  PurchaseOrderItemRelationType,
  PurchaseOrderItemInsertType,
  PurchaseOrderItemUpdateType,
  PurchaseOrderItemSortType
> {
  constructor() {
    super(PurchaseOrderItem)
  }
}

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
}
