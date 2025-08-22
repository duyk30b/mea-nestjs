import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, Repository } from 'typeorm'
import { PurchaseOrder, PurchaseOrderItem } from '../entities'
import {
  PurchaseOrderInsertType,
  PurchaseOrderRelationType,
  PurchaseOrderSortType,
  PurchaseOrderStatus,
  PurchaseOrderUpdateType,
} from '../entities/purchase-order.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PurchaseOrderManager extends _PostgreSqlManager<
  PurchaseOrder,
  PurchaseOrderRelationType,
  PurchaseOrderInsertType,
  PurchaseOrderUpdateType,
  PurchaseOrderSortType
> {
  constructor() {
    super(PurchaseOrder)
  }
}

@Injectable()
export class PurchaseOrderRepository extends _PostgreSqlRepository<
  PurchaseOrder,
  PurchaseOrderRelationType,
  PurchaseOrderInsertType,
  PurchaseOrderUpdateType,
  PurchaseOrderSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>
  ) {
    super(PurchaseOrder, purchaseOrderRepository)
  }

  async destroy(params: { oid: number; purchaseOrderId: number }) {
    const { oid, purchaseOrderId } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderDeleteResult = await manager.delete(PurchaseOrder, {
        oid,
        id: purchaseOrderId,
        paid: 0,
        status: In([PurchaseOrderStatus.Draft, PurchaseOrderStatus.Cancelled]),
      })
      if (purchaseOrderDeleteResult.affected !== 1) {
        throw new Error(`Delete PurchaseOrder ${purchaseOrderId} failed: Status invalid`)
      }
      await manager.delete(PurchaseOrderItem, { oid, purchaseOrderId })
    })
  }
}
