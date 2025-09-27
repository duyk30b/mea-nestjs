import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PurchaseOrder } from '../../entities'
import PurchaseOrderItem, {
  PurchaseOrderItemInsertType,
} from '../../entities/purchase-order-item.entity'
import { PurchaseOrderStatus, PurchaseOrderUpdateType } from '../../entities/purchase-order.entity'
import { PurchaseOrderItemManager, PurchaseOrderManager } from '../../repositories'

export type PurchaseOrderDepositedUpdateType = Omit<
  PurchaseOrderUpdateType,
  keyof Pick<
    PurchaseOrder,
    | 'oid'
    | 'status'
    | 'deliveryStatus'
    | 'paid'
    | 'debt'
    | 'year'
    | 'month'
    | 'date'
    | 'endedAt'
    | 'distributorId'
  >
>

export type PurchaseOrderItemDepositedType = Omit<
  PurchaseOrderItemInsertType,
  keyof Pick<PurchaseOrderItem, 'oid' | 'purchaseOrderId' | 'distributorId'>
>

@Injectable()
export class PurchaseOrderDepositedOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private purchaseOrderItemManager: PurchaseOrderItemManager
  ) { }

  async update<
    T extends PurchaseOrderDepositedUpdateType,
    X extends PurchaseOrderItemDepositedType,
  >(params: {
    oid: number
    purchaseOrderId: string
    purchaseOrderUpdateDto: NoExtra<PurchaseOrderDepositedUpdateType, T>
    purchaseOrderItemListDto: NoExtra<PurchaseOrderItemDepositedType, X>[]
  }) {
    const { oid, purchaseOrderId, purchaseOrderUpdateDto, purchaseOrderItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderUpdate: PurchaseOrderDepositedUpdateType = {
        ...purchaseOrderUpdateDto,
        oid,
        status: PurchaseOrderStatus.Deposited,
        // paid: 0, // giữ nguyên số tiền đã trả
        debt: () => `${purchaseOrderUpdateDto.totalMoney} - paid`,
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
          status: PurchaseOrderStatus.Deposited,
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
