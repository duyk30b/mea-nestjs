import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../common/variable'
import { PurchaseOrder, PurchaseOrderItem } from '../../entities'
import { PurchaseOrderItemInsertType } from '../../entities/purchase-order-item.entity'
import { PurchaseOrderInsertType, PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { PurchaseOrderItemManager, PurchaseOrderManager } from '../../repositories'

export type PurchaseOrderDraftUpsertType = Omit<
  PurchaseOrderInsertType,
  keyof Pick<
    PurchaseOrder,
    'oid' | 'status' | 'deliveryStatus' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt'
  >
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
    private purchaseOrderManager: PurchaseOrderManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager
  ) { }

  async createDraft<T extends PurchaseOrderDraftUpsertType, X extends PurchaseOrderItemDraftType>(params: {
    oid: number
    purchaseOrderInsertDto: NoExtra<PurchaseOrderDraftUpsertType, T>
    purchaseOrderItemListDto: NoExtra<PurchaseOrderItemDraftType, X>[]
  }) {
    const { oid, purchaseOrderInsertDto, purchaseOrderItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderInsert: PurchaseOrderInsertType = {
        ...purchaseOrderInsertDto,
        oid,
        status: PurchaseOrderStatus.Draft,
        deliveryStatus: DeliveryStatus.Pending,
        distributorId: purchaseOrderInsertDto.distributorId,
        paid: 0,
        debt: purchaseOrderInsertDto.totalMoney,
        year: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).year,
        month: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).month + 1,
        date: ESTimer.info(purchaseOrderInsertDto.startedAt, 7).date,
        endedAt: null,
      }

      const purchaseOrder = await this.purchaseOrderManager.insertOneAndReturnEntity(manager, purchaseOrderInsert)

      const purchaseOrderItemListInsert = purchaseOrderItemListDto.map((i) => {
        const purchaseOrderItem: PurchaseOrderItemInsertType = {
          ...i,
          oid,
          purchaseOrderId: purchaseOrder.id,
          distributorId: purchaseOrderInsert.distributorId,
        }
        return purchaseOrderItem
      })
      await this.purchaseOrderItemManager.insertMany(manager, purchaseOrderItemListInsert)

      return { purchaseOrder }
    })
  }

  async updateDraft<T extends PurchaseOrderDraftUpsertType, X extends PurchaseOrderItemDraftType>(params: {
    oid: number
    purchaseOrderId: number
    purchaseOrderUpdateDto: NoExtra<PurchaseOrderDraftUpsertType, T>
    purchaseOrderItemListDto: NoExtra<PurchaseOrderItemDraftType, X>[]
  }) {
    const { oid, purchaseOrderId, purchaseOrderUpdateDto, purchaseOrderItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderUpdate: PurchaseOrderDraftUpsertType = {
        ...purchaseOrderUpdateDto,
        oid,
        distributorId: purchaseOrderUpdateDto.distributorId,
        status: PurchaseOrderStatus.Draft,
        paid: 0,
        debt: purchaseOrderUpdateDto.totalMoney,
        year: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).year,
        month: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).month + 1,
        date: ESTimer.info(purchaseOrderUpdateDto.startedAt as number, 7).date,
        endedAt: null,
      }
      const purchaseOrder = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          id: purchaseOrderId,
          oid,
          status: PurchaseOrderStatus.Draft,
        },
        purchaseOrderUpdate
      )

      await this.purchaseOrderItemManager.delete(manager, { oid, purchaseOrderId })
      const purchaseOrderItemListInsert = purchaseOrderItemListDto.map((i) => {
        const purchaseOrderItem: PurchaseOrderItemInsertType = {
          ...i,
          oid,
          purchaseOrderId,
          distributorId: purchaseOrder.distributorId,
        }
        return purchaseOrderItem
      })
      await this.purchaseOrderItemManager.insertMany(manager, purchaseOrderItemListInsert)
      return { purchaseOrder }
    })
  }
}
