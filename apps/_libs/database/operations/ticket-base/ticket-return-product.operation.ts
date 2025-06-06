import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { TicketUser } from '../../entities'
import { InteractType } from '../../entities/commission.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  TicketBatchManager,
  TicketManager,
  TicketProductManager,
  TicketUserManager,
} from '../../managers'
import { ProductPutawayOperation } from '../product/product-putaway.operation'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

@Injectable()
export class TicketReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productMovementManager: ProductMovementManager,
    private productPutawayOperation: ProductPutawayOperation
  ) { }

  async returnProduct(data: {
    oid: number
    ticketId: number
    time: number
    returnList: {
      ticketBatchId: number
      quantityReturn: number
    }[]
    options?: { changePendingIfNoStock?: boolean }
  }) {
    const { oid, ticketId, time, returnList, options } = data
    const PREFIX = `TicketId = ${ticketId}, returnProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, returnProduct has a logic error occurred: `

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: { IN: [TicketStatus.Executing] } },
        { updatedAt: Date.now() }
      )

      if (!returnList.length) return { ticket: ticketOrigin }

      const ticketBatchOriginList = await this.ticketBatchManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: returnList.filter((i) => !!i.ticketBatchId).map((i) => i.ticketBatchId) },
      })
      const ticketBatchOriginMap = ESArray.arrayToKeyValue(ticketBatchOriginList, 'id')

      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: ticketBatchOriginList.map((i) => i.ticketProductId) },
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // === 2. Product and Batch origin
      const productIdList = ticketBatchOriginList.map((i) => i.productId)
      const batchIdList = ticketBatchOriginList.map((i) => i.batchId)
      const productOriginList = await this.productManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(productIdList) } },
        { updatedAt: time }
      )
      const batchOriginList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, id: { IN: ESArray.uniqueArray(batchIdList) } },
        { updatedAt: time }
      )
      const putawayContainer = this.productPutawayOperation.generatePutawayPlan({
        productOriginList,
        batchOriginList,
        voucherBatchList: returnList.map((i) => {
          const ticketBatchOrigin = ticketBatchOriginMap[i.ticketBatchId]
          return {
            voucherProductId: ticketBatchOrigin.ticketProductId,
            voucherBatchId: i.ticketBatchId,
            warehouseId: ticketBatchOrigin.warehouseId,
            productId: ticketBatchOrigin.productId,
            batchId: ticketBatchOrigin.batchId,
            quantity: i.quantityReturn,
            costAmount:
              ticketBatchOrigin.quantity == 0
                ? 0
                : (ticketBatchOrigin.costAmount * i.quantityReturn) / ticketBatchOrigin.quantity,
          }
        }),
      })

      // 3. === UPDATE for TICKET_PRODUCT ===
      const ticketProductModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Delivered } },
        compare: ['id', 'productId'],
        tempList: putawayContainer.putawayVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
        update: options?.changePendingIfNoStock
          ? {
            quantity: (t: string, u: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN "quantity"
                                    ELSE "${u}"."quantity" - "${t}"."putawayQuantity"
                                  END`,
            costAmount: () => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.Pending}
                                    ELSE "deliveryStatus"
                                  END`,
          }
          : {
            quantity: () => `"quantity" - "putawayQuantity"`,
            costAmount: () => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.NoStock}
                                    ELSE "deliveryStatus"
                                  END`,
          },
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: UPDATE ===
      const ticketBatchModifiedList = await this.ticketBatchManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Delivered } },
        compare: ['id', 'ticketProductId', 'productId', 'batchId'],
        tempList: putawayContainer.putawayVoucherBatchList.map((i) => {
          return {
            id: i.voucherBatchId,
            ticketProductId: i.voucherProductId,
            productId: i.productId,
            batchId: i.batchId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
        update: {
          quantity: () => `"quantity" - "putawayQuantity"`,
          costAmount: () => `"costAmount" - "putawayCostAmount"`,
          deliveryStatus: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.NoStock}
                                    ELSE ${DeliveryStatus.Delivered}
                                  END`,
        },
        options: { requireEqualLength: true },
      })
      const ticketBatchModifiedMap = ESArray.arrayToKeyValue(ticketBatchModifiedList, 'id')
      const tbModifiedNoStockList = ticketBatchModifiedList.filter((i) => {
        return i.deliveryStatus === DeliveryStatus.NoStock
      })
      if (tbModifiedNoStockList.length) {
        await this.ticketBatchManager.deleteAndReturnEntity(manager, {
          oid,
          id: { IN: tbModifiedNoStockList.map((i) => i.id) },
        })
      }

      // 5. === UPDATE for PRODUCT and BATCH ===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: putawayContainer.putawayProductList.map((i) => {
          return {
            id: i.productId,
            putawayQuantity: i.putawayQuantity, // không được cộng trừ theo thằng này vì trường hợp NoImpact
            quantity: i.closeQuantity,
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
        tempList: putawayContainer.putawayBatchList
          .filter((i) => !!i.batchId)
          .map((i) => {
            return {
              id: i.batchId,
              productId: i.productId,
              putawayQuantity: i.putawayQuantity,
              putawayCostAmount: i.putawayCostAmount,
            }
          }),
        update: {
          quantity: () => `"quantity" + "putawayQuantity"`,
          costAmount: () => `"costAmount" + "putawayCostAmount"`,
        },
        options: { requireEqualLength: true },
      })
      const batchMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

      // 6. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList = putawayContainer.putawayMovementList.map((paMovement) => {
        const tpOrigin = ticketProductOriginMap[paMovement.voucherProductId]
        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.Ticket,
          contactId: ticketOrigin.customerId,
          voucherId: ticketOrigin.id,
          voucherProductId: tpOrigin.id,
          warehouseId: paMovement.warehouseId,
          productId: paMovement.productId,
          batchId: paMovement.batchId,

          createdAt: time,
          isRefund: 1,
          expectedPrice: tpOrigin.expectedPrice,
          actualPrice: tpOrigin.actualPrice,

          quantity: paMovement.putawayQuantity,
          costAmount: paMovement.putawayCostAmount,
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

      // 9. === TICKET_USER and COMMISSION
      const ticketUserOriginList = await this.ticketUserManager.findManyBy(manager, {
        oid,
        ticketId,
        interactType: InteractType.Product,
        ticketItemId: { IN: ticketProductModifiedList.map((i) => i.id) },
      })
      let ticketUserModifiedList: TicketUser[] = []
      let ticketUserDestroyedList: TicketUser[] = []
      let commissionMoneyReturn = 0
      if (ticketUserOriginList.length) {
        const result = await this.ticketUserManager.changeQuantityByTicketItem({
          manager,
          information: { oid, ticketId, interactType: InteractType.Product },
          dataChange: ticketProductModifiedList.map((i) => {
            return { quantity: i.quantity, ticketItemId: i.id }
          }),
        })
        ticketUserModifiedList = result.ticketUserModifiedList
        ticketUserDestroyedList = result.ticketUserDestroyedList

        commissionMoneyReturn =
          ticketUserOriginList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserModifiedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // 10. === UPDATE TICKET: product money ===
      let productMoneyReturn = 0
      let productDiscountReturn = 0
      let itemsCostAmountReturn = 0
      ticketProductOriginList.forEach((tpOrigin) => {
        const tpModified = ticketProductModifiedMap[tpOrigin.id]
        productMoneyReturn
          += tpOrigin.actualPrice * tpOrigin.quantity - tpModified.actualPrice * tpModified.quantity
        productDiscountReturn
          += tpOrigin.discountMoney * tpOrigin.quantity
          - tpModified.discountMoney * tpModified.quantity
        itemsCostAmountReturn += tpOrigin.costAmount - tpModified.costAmount
      })

      const ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
        manager,
        oid,
        ticketOrigin,
        itemMoney: {
          productMoneyAdd: -productMoneyReturn,
          itemsCostAmountAdd: -itemsCostAmountReturn,
          itemsDiscountAdd: -productDiscountReturn,
          commissionMoneyAdd: -commissionMoneyReturn,
        },
      })

      return {
        ticket,
        productModifiedList,
        ticketProductModifiedList,
        ticketUserModifiedList,
        ticketUserDestroyedList,
      }
    })
  }
}
