import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../common/variable'
import { PurchaseOrder, PurchaseOrderItem } from '../../entities'
import { PurchaseOrderItemInsertType } from '../../entities/purchase-order-item.entity'
import {
  PurchaseOrderInsertType,
  PurchaseOrderStatus,
  PurchaseOrderUpdateType,
} from '../../entities/purchase-order.entity'
import { PurchaseOrderItemRepository, PurchaseOrderRepository } from '../../repositories'

export type PurchaseOrderDraftUpsertType = Pick<
  PurchaseOrder,
  | 'distributorId'
  | 'itemsActualMoney'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'surcharge'
  | 'totalMoney'
  | 'note'
  | 'startedAt'
>

export type PurchaseOrderItemDraftType = Omit<
  PurchaseOrderItemInsertType,
  keyof Pick<PurchaseOrderItem, 'oid' | 'purchaseOrderId' | 'distributorId'>
>
@Injectable()
export class PurchaseOrderDraftOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository
  ) { }

  async createDraft<
    T extends PurchaseOrderDraftUpsertType,
    X extends PurchaseOrderItemDraftType,
  >(props: {
    oid: number
    purchaseOrderInsertDto: NoExtra<PurchaseOrderDraftUpsertType, T>
    purchaseOrderItemListDto: NoExtra<PurchaseOrderItemDraftType, X>[]
  }) {
    const { oid, purchaseOrderItemListDto } = props
    const purchaseOrderInsertDto: PurchaseOrderDraftUpsertType = props.purchaseOrderInsertDto
    const startedAt = purchaseOrderInsertDto.startedAt

    const purchaseOrderId = await this.purchaseOrderRepository.nextId({ oid, startedAt })

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderInsert: PurchaseOrderInsertType = {
        ...purchaseOrderInsertDto,
        id: purchaseOrderId,
        oid,
        status: PurchaseOrderStatus.Draft,
        deliveryStatus: DeliveryStatus.Pending,
        distributorId: purchaseOrderInsertDto.distributorId,
        paid: 0,
        debt: 0,
        year: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).year,
        month: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).month + 1,
        date: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).date,
        endedAt: null,
      }

      const purchaseOrder = await this.purchaseOrderRepository.managerInsertOne(
        manager,
        purchaseOrderInsert
      )

      const purchaseOrderItemListInsert = purchaseOrderItemListDto.map((i) => {
        const itemDraft: PurchaseOrderItemDraftType = i
        const purchaseOrderItem: PurchaseOrderItemInsertType = {
          ...itemDraft,
          oid,
          purchaseOrderId: purchaseOrder.id,
          distributorId: purchaseOrderInsert.distributorId,
        }
        return purchaseOrderItem
      })
      await this.purchaseOrderItemRepository.managerInsertMany(manager, purchaseOrderItemListInsert)

      return { purchaseOrder }
    })
  }

  async updateDraft<
    T extends PurchaseOrderDraftUpsertType,
    X extends PurchaseOrderItemDraftType,
  >(props: {
    oid: number
    purchaseOrderId: string
    purchaseOrderUpdateDto: NoExtra<PurchaseOrderDraftUpsertType, T>
    purchaseOrderItemListDto: NoExtra<PurchaseOrderItemDraftType, X>[]
  }) {
    const { oid, purchaseOrderId } = props
    const purchaseOrderUpdateDto: PurchaseOrderDraftUpsertType = props.purchaseOrderUpdateDto
    const purchaseOrderItemListDto: PurchaseOrderItemDraftType[] = props.purchaseOrderItemListDto

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderUpdate: PurchaseOrderUpdateType = {
        ...purchaseOrderUpdateDto,
        distributorId: purchaseOrderUpdateDto.distributorId,
        status: PurchaseOrderStatus.Draft,
        deliveryStatus: DeliveryStatus.Pending,
        paid: 0,
        debt: purchaseOrderUpdateDto.totalMoney,
        year: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).year,
        month: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).month + 1,
        date: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).date,
        endedAt: null,
      }
      const purchaseOrder = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          id: purchaseOrderId,
          oid,
          status: PurchaseOrderStatus.Draft,
        },
        purchaseOrderUpdate
      )

      await this.purchaseOrderItemRepository.managerDelete(manager, { oid, purchaseOrderId })
      const purchaseOrderItemListInsert = purchaseOrderItemListDto.map((i) => {
        const purchaseOrderItem: PurchaseOrderItemInsertType = {
          ...i,
          oid,
          purchaseOrderId,
          distributorId: purchaseOrder.distributorId,
        }
        return purchaseOrderItem
      })
      await this.purchaseOrderItemRepository.managerInsertMany(manager, purchaseOrderItemListInsert)
      return { purchaseOrder }
    })
  }
}
