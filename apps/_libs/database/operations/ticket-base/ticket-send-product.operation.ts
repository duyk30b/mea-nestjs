import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketBatchInsertType } from '../../entities/ticket-batch.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  TicketBatchManager,
  TicketManager,
  TicketProductManager,
} from '../../managers'
import { ProductPickingOperation } from '../product/product-picking.operation'
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
    private ticketManager: TicketManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private productMovementManager: ProductMovementManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPickingOperation: ProductPickingOperation
  ) { }

  async sendProduct(data: {
    oid: number
    ticketId: number
    ticketProductIdList: number[]
    time: number
    allowNegativeQuantity: boolean
  }) {
    const { oid, ticketId, time, ticketProductIdList, allowNegativeQuantity } = data
    const PREFIX = `TicketId = ${ticketId}, sendProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, sendProduct has a logic error occurred: `

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticket = await this.ticketManager.updateOneAndReturnEntity(
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
      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: ticketProductIdList },
        deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
      })
      if (ticketProductOriginList.length === 0) {
        return { ticket }
      }
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // === 2. Product and Batch origin
      const productIdList = ticketProductOriginList.map((i) => i.productId)
      const productOriginList = await this.productManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: productIdList }, isActive: 1 },
        { updatedAt: time }
      )
      const batchOriginList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, productId: { IN: productIdList }, isActive: 1 },
        { updatedAt: time }
      )
      const batchOriginMap = ESArray.arrayToKeyValue(batchOriginList, 'id')
      const pickingContainer = this.productPickingOperation.generatePickingPlan({
        productOriginList,
        batchOriginList,
        voucherBatchList: ticketProductOriginList.map((i) => {
          return {
            ...i,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
        allowNegativeQuantity,
      })

      // 3. === TICKET_PRODUCT: update Delivery ===
      const ticketProductModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Pending } },
        compare: ['id', 'productId', 'quantity'],
        tempList: pickingContainer.pickingVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            quantity: i.pickingQuantity,
            costAmount: i.pickingCostAmount,
            deliveryStatus: DeliveryStatus.Delivered,
          }
        }),
        update: ['costAmount', 'deliveryStatus'],
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: insert
      const ticketBatchInsertList = pickingContainer.pickingVoucherBatchList.map(
        (pickingTicketBatch) => {
          const tp = ticketProductModifiedMap[pickingTicketBatch.voucherProductId]
          const batchOrigin = batchOriginMap[pickingTicketBatch.batchId]
          const ticketBatchInsert: TicketBatchInsertType = {
            oid,
            ticketId,
            customerId: tp.customerId,
            ticketProductId: tp.id,
            warehouseId: batchOrigin?.warehouseId || 0,
            productId: tp.productId,
            batchId: pickingTicketBatch.batchId || 0, // thằng pickupStrategy.NoImpact luôn lấy batchId = 0
            deliveryStatus: DeliveryStatus.Delivered,
            unitRate: tp.unitRate,
            quantity: pickingTicketBatch.pickingQuantity,
            costAmount: pickingTicketBatch.pickingCostAmount,
            actualPrice: tp.actualPrice,
            expectedPrice: tp.expectedPrice,
          }
          return ticketBatchInsert
        }
      )
      await this.ticketBatchManager.insertManyAndReturnEntity(manager, ticketBatchInsertList)

      // 4. === UPDATE for PRODUCT and BATCH ===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid }, // thằng NoImpact Inventory vẫn được update nhé
        compare: ['id'],
        tempList: pickingContainer.pickingProductList.map((i) => {
          return {
            id: i.productId,
            quantity: i.closeQuantity,
            pickingQuantity: i.pickingQuantity, // không được cộng trừ theo thằng này, vì với trường hợp NoImpact nó vẫn nhặt
          }
        }),
        update: ['quantity'],
        options: { requireEqualLength: true },
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id', 'productId'],
        tempList: pickingContainer.pickingBatchList
          .filter((i) => !!i.batchId)
          .map((i) => {
            return {
              id: i.batchId,
              productId: i.productId,
              pickingQuantity: i.pickingQuantity,
              pickingCostAmount: i.pickingCostAmount,
            }
          }),
        update: {
          quantity: () => `"quantity" - "pickingQuantity"`,
          costAmount: () => `"costAmount" - "pickingCostAmount"`,
        },
        options: { requireEqualLength: true },
      })
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

      // === 5. CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList = pickingContainer.pickingMovementList.map((paMovement) => {
        const tpOrigin = ticketProductOriginMap[paMovement.voucherProductId]
        const batch = batchModifiedMap[paMovement.batchId] // có thể null
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.Ticket,
          contactId: ticket.customerId,
          voucherId: ticket.id,
          voucherProductId: tpOrigin.id,
          warehouseId: batch?.warehouseId || 0,
          productId: paMovement.productId,
          batchId: paMovement.batchId,

          createdAt: time,
          isRefund: 0,
          expectedPrice: tpOrigin.expectedPrice,
          actualPrice: tpOrigin.actualPrice,

          quantity: -paMovement.pickingQuantity,
          costAmount: -paMovement.pickingCostAmount,
          openQuantityProduct: paMovement.openQuantityProduct,
          closeQuantityProduct: paMovement.closeQuantityProduct,
          openQuantityBatch: paMovement.openQuantityBatch,
          closeQuantityBatch: paMovement.closeQuantityBatch,
          openCostAmountBatch: paMovement.openCostAmountBatch,
          closeCostAmountBatch: paMovement.closeCostAmountBatch,
        }
        return productMovementInsert
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      // 6. === UPDATE: TICKET MONEY AND DELIVERY ===
      const costAmountOrigin = ticketProductOriginList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountModified = ticketProductModifiedList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountAdd = costAmountModified - costAmountOrigin

      // === 4. ReCalculator DeliveryStatus
      const ticketProductAfterAll = await this.ticketProductManager.findMany(manager, {
        condition: { ticketId },
      })
      let deliveryStatus = DeliveryStatus.Delivered
      if (ticketProductAfterAll.every((i) => i.deliveryStatus === DeliveryStatus.NoStock)) {
        deliveryStatus = DeliveryStatus.NoStock
      }
      if (ticketProductAfterAll.some((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        deliveryStatus = DeliveryStatus.Pending
      }

      if (costAmountAdd != 0 || deliveryStatus !== ticket.deliveryStatus) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticket,
          itemMoney: {
            itemsCostAmountAdd: costAmountAdd,
          },
          other: { deliveryStatus },
        })
      }

      return {
        ticket,
        ticketProductModifiedList,
        productModifiedList,
        batchModifiedList,
      }
    })
  }
}
