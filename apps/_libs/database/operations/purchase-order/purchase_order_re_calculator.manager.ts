import { PurchaseOrderStatus } from '@libs/database/entities/purchase-order.entity'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { DeliveryStatus, DiscountType } from '../../common/variable'
import { PurchaseOrder } from '../../entities'
import { PurchaseOrderItemRepository, PurchaseOrderRepository } from '../../repositories'

@Injectable()
export class PurchaseOrderReCalculatorManager {
  constructor(
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository
  ) {}

  async startRecalculate(props: {
    manager?: EntityManager
    purchaseOrderId?: string
    purchaseOrderOrigin?: PurchaseOrder
    oid: number
  }) {
    const { manager, purchaseOrderId, oid } = props
    let purchaseOrderOrigin = props.purchaseOrderOrigin
    if (!purchaseOrderOrigin) {
      purchaseOrderOrigin = await this.purchaseOrderRepository.managerFindOneBy(manager, {
        oid,
        id: purchaseOrderId,
      })
    }
    const { deliveryStatus, purchaseOrderItemAll } =
      await this.purchaseOrderItemRepository.calculatorDeliveryStatus({
        manager,
        oid,
        purchaseOrderId,
      })

    const itemsActualMoneyUpdate = purchaseOrderItemAll.reduce((acc, item) => {
      return acc + (item.quantity * item.unitCostPrice) / item.unitRate
    }, 0)

    const discountType = purchaseOrderOrigin.discountType
    let discountPercentUpdate = purchaseOrderOrigin.discountPercent
    let discountMoneyUpdate = purchaseOrderOrigin.discountMoney
    if (itemsActualMoneyUpdate !== 0) {
      if (discountType === DiscountType.VND) {
        discountPercentUpdate = Math.floor((discountMoneyUpdate * 100) / itemsActualMoneyUpdate)
      }
      if (discountType === DiscountType.Percent) {
        discountMoneyUpdate = Math.floor((discountPercentUpdate * itemsActualMoneyUpdate) / 100)
      }
    }

    const totalMoney = itemsActualMoneyUpdate - discountMoneyUpdate + purchaseOrderOrigin.surcharge

    const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
      manager,
      { oid, id: purchaseOrderId },
      {
        itemsActualMoney: itemsActualMoneyUpdate,
        discountMoney: discountMoneyUpdate,
        discountPercent: discountPercentUpdate,
        totalMoney,
        deliveryStatus,
      }
    )

    return { purchaseOrderModified, purchaseOrderItemAll }
  }
}
