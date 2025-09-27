import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { GenerateId } from '../../common/generate-id'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { TicketProduct } from '../../entities'
import { TicketBatchInsertType } from '../../entities/ticket-batch.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketBatchRepository,
  TicketProductManager,
  TicketProductRepository,
  TicketRepository,
} from '../../repositories'
import { ProductPickupManager } from '../product/product-pickup.manager'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type SendItem = {
  ticketProductId: number
  productId: number
  batchId: number // batchId = 0 là chỉ định cho nhiều lô, hoặc không lô nào cả
  quantitySend: number
  costAmountSend: number // ticketProduct không thể tính theo costPrice được, vì phải nhân chia theo costAmount của batch (costPrice gây sai lệch)
  warehouseId: number
}

@Injectable()
export class TicketSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketProductManager: TicketProductManager,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPickupManager: ProductPickupManager
  ) { }

  async sendProduct(data: {
    oid: number
    ticketId: string
    ticketProductIdList: string[]
    sendAll: boolean
    time: number
    allowNegativeQuantity: boolean
  }) {
    const { oid, ticketId, time, sendAll, ticketProductIdList, allowNegativeQuantity } = data
    const PREFIX = `TicketId = ${ticketId}, sendProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, sendProduct has a logic error occurred: `

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Deposited, TicketStatus.Executing],
          },
        },
        { updatedAt: Date.now(), status: TicketStatus.Executing }
      )

      let ticketProductOriginList: TicketProduct[] = []
      if (sendAll) {
        ticketProductOriginList = await this.ticketProductRepository.managerFindManyBy(manager, {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
        })
      } else {
        ticketProductOriginList = await this.ticketProductRepository.managerFindManyBy(manager, {
          oid,
          ticketId,
          id: { IN: ticketProductIdList },
          deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
        })
      }
      if (ticketProductOriginList.length === 0) {
        return { ticketModified }
      }
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // === 2. Product and Batch origin
      const pickupContainer = await this.productPickupManager.startPickup({
        manager,
        oid,
        voucherId: ticketId,
        contactId: ticketModified.customerId,
        movementType: MovementType.Ticket,
        isRefund: 0,
        time,
        allowNegativeQuantity,
        voucherProductPickupList: ticketProductOriginList.map((i) => {
          return {
            pickupStrategy: i.pickupStrategy,
            expectedPrice: i.expectedPrice,
            actualPrice: i.actualPrice,
            productId: i.productId,
            batchId: i.batchId,
            warehouseIds: i.warehouseIds,
            quantity: i.quantity,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
      })
      const { pickupPlan, batchModifiedList, productModifiedList } = pickupContainer
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      // 3. === TICKET_PRODUCT: update Delivery ===
      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Pending } },
        compare: { id: { cast: 'bigint' }, productId: true, quantity: true },
        tempList: pickupPlan.pickupVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            quantity: i.pickupQuantity,
            costAmount: i.pickupCostAmount,
            deliveryStatus: DeliveryStatus.Delivered,
          }
        }),
        update: ['costAmount', 'deliveryStatus'],
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: insert
      const ticketBatchInsertList = pickupPlan.pickupVoucherBatchList.map((pickupTicketBatch) => {
        const tp = ticketProductModifiedMap[pickupTicketBatch.voucherProductId]
        const batchOrigin = batchModifiedMap[pickupTicketBatch.batchId]
        const ticketBatchInsert: TicketBatchInsertType = {
          id: GenerateId.nextId(),
          oid,
          ticketId,
          customerId: tp.customerId,
          ticketProductId: tp.id,
          warehouseId: batchOrigin?.warehouseId || 0,
          productId: tp.productId,
          batchId: pickupTicketBatch.batchId || 0, // thằng pickupStrategy.NoImpact luôn lấy batchId = 0
          deliveryStatus: DeliveryStatus.Delivered,
          unitRate: tp.unitRate,
          quantity: pickupTicketBatch.pickupQuantity,
          costAmount: pickupTicketBatch.pickupCostAmount,
          actualPrice: tp.actualPrice,
          expectedPrice: tp.expectedPrice,
        }
        return ticketBatchInsert
      })
      await this.ticketBatchRepository.managerInsertMany(manager, ticketBatchInsertList)

      // 4. === UPDATE for PRODUCT and BATCH ===

      // 6. === UPDATE: TICKET MONEY AND DELIVERY ===
      const costAmountOrigin = ticketProductOriginList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountModified = ticketProductModifiedList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountAdd = costAmountModified - costAmountOrigin

      // === 4. ReCalculator DeliveryStatus
      const { deliveryStatus, ticketProductList } =
        await this.ticketProductManager.calculatorDeliveryStatus({
          manager,
          oid,
          ticketId,
        })

      if (costAmountAdd != 0 || deliveryStatus !== ticketModified.deliveryStatus) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            itemsCostAmountAdd: costAmountAdd,
          },
          other: { deliveryStatus },
        })
      }

      return {
        ticketModified,
        ticketProductModifiedAll: ticketProductList,
        productModifiedList,
        batchModifiedList,
      }
    })
  }
}
