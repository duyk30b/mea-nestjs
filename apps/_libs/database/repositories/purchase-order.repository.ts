import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { ESTimer } from '../../common/helpers'
import { PurchaseOrder } from '../entities'
import {
  PurchaseOrderInsertType,
  PurchaseOrderRelationType,
  PurchaseOrderSortType,
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

  async nextId(props: { oid: number; startedAt: number }) {
    const { oid, startedAt } = props
    const ddmmyy = ESTimer.timeToText(startedAt, 'YYMMDD')
    const dayNumber = Number(oid + ddmmyy)
    const purchaseOrderListToday = await this.findManyBy({
      oid,
      id: {
        GTE: (dayNumber * 10000) as any,
        LT: ((dayNumber + 1) * 10000) as any,
      },
    })
    const purchaseOrderIndexList = purchaseOrderListToday.map((i) => Number(i.id.slice(-4)))
    const nextIndex = Math.max(...purchaseOrderIndexList, 0)

    const oidText = String(oid).padStart(4, '0')
    const timeText = ESTimer.timeToText(new Date(), 'YYMMDD', 7)
    const indexText = String(nextIndex + 1).padStart(4, '0')

    const id = oidText + timeText + indexText

    return id
  }
}
