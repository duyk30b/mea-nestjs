import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { TicketBatch, TicketProduct, TicketUser } from '../../entities'
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
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

@Injectable()
export class TicketReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async returnProduct(params: {
    oid: number
    ticketId: number
    time: number
    returnList: {
      ticketBatchId: number
      quantity: number
    }[]
  }) {
    const { oid, ticketId, time, returnList } = params
    const PREFIX = `TicketId = ${ticketId}, returnProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, returnProduct has a logic error occurred: `

    if (!returnList.length) {
      throw new Error(`${PREFIX}: returnList.length = 0`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Executing] },
        },
        { updatedAt: Date.now() }
      )

      // 2. === TICKET_PRODUCT & TICKET_BATCH ===
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

      // 3. === CALCULATOR data ===
      const tpCalcMap: Record<
        string,
        { ticketProductId: number; productId: number; sumQuantity: number; sumCostAmount: number }
      > = {}
      const productCalcMap: Record<
        string,
        { productId: number; openQuantity: number; sumQuantity: number }
      > = {}
      const batchCalcMap: Record<string, { batchId: number; sumQuantity: number }> = {}

      returnList.forEach((i) => {
        const { ticketBatchId } = i
        const tbOrigin = ticketBatchOriginMap[ticketBatchId]
        const { productId, batchId, ticketProductId } = tbOrigin

        // const tpOrigin = ticketProductOriginMap[ticketProductId]
        if (!tpCalcMap[ticketProductId]) {
          tpCalcMap[ticketProductId] = {
            ticketProductId,
            productId,
            sumQuantity: 0,
            sumCostAmount: 0,
          }
        }
        if (!productCalcMap[productId]) {
          productCalcMap[productId] = { productId, openQuantity: 0, sumQuantity: 0 }
        }
        if (!batchCalcMap[batchId]) {
          batchCalcMap[batchId] = { batchId, sumQuantity: 0 }
        }

        tpCalcMap[ticketProductId].sumQuantity += i.quantity
        tpCalcMap[ticketProductId].sumCostAmount += i.quantity * tbOrigin.costPrice

        if (batchId != 0) {
          productCalcMap[productId].sumQuantity += i.quantity
          batchCalcMap[batchId].sumQuantity += i.quantity
        }
      })

      // 4. === UPDATE for TICKET_PRODUCT ===
      const tpCalcValue = Object.values(tpCalcMap)
      const ticketProductModifiedRaw = await manager.query(
        `
        UPDATE  "TicketProduct" tp
        SET     "quantity"          = tp."quantity" - temp."sumQuantity",
                "costAmount"        = tp."costAmount" - temp."sumCostAmount",
                "deliveryStatus"    = CASE
                                        WHEN  (tp."quantity" = temp."sumQuantity")
                                          THEN ${DeliveryStatus.NoStock}
                                        ELSE ${DeliveryStatus.Delivered}
                                      END
        FROM (VALUES `
        + tpCalcValue
          .map((i) => {
            return `(${i.ticketProductId}, ${i.productId}, ${i.sumQuantity}, ${i.sumCostAmount})`
          })
          .join(', ')
        + `   ) AS temp("ticketProductId", "productId", "sumQuantity", "sumCostAmount")
        WHERE   tp."oid"            = ${oid}
            AND tp."ticketId"       = ${ticketId}
            AND tp."id"             = temp."ticketProductId"
            AND tp."productId"      = temp."productId"
        RETURNING tp.*;
        `
      )
      if (ticketProductModifiedRaw[0].length != tpCalcValue.length) {
        throw new Error(
          `${PREFIX}: Update TicketProduct, affected = ${ticketProductModifiedRaw[1]}`
        )
      }
      const ticketProductModifiedList = TicketProduct.fromRaws(ticketProductModifiedRaw[0])
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 5. === TICKET_BATCH: UPDATE ===
      const tbCalcValue = returnList.filter((i) => !!i.ticketBatchId)
      let ticketBatchModifiedList: TicketBatch[] = []
      if (tbCalcValue.length) {
        const ticketBatchModifiedRaw: [any[], number] = await manager.query(
          `
          UPDATE  "TicketBatch" tb
          SET     "quantity"        = tb."quantity" - temp."quantity",
                  "deliveryStatus"  = CASE 
                                        WHEN  (tb."quantity" = temp."quantity") 
                                          THEN ${DeliveryStatus.NoStock} 
                                        ELSE ${DeliveryStatus.Delivered} 
                                      END
          FROM (VALUES `
          + tbCalcValue.map((i) => `(${i.ticketBatchId}, ${i.quantity})`).join(', ')
          + `   ) AS temp("ticketBatchId", "quantity")
          WHERE   tb."oid"            = ${oid}
              AND tb."ticketId"       = ${ticketId}
              AND tb."id"             = temp."ticketBatchId"
              AND tb."deliveryStatus" = ${DeliveryStatus.Delivered}
          RETURNING tb.*;
          `
        )
        if (ticketBatchModifiedRaw[0].length != tbCalcValue.length) {
          throw new Error(`${PREFIX}: Update TicketBatch, affected = ${ticketBatchModifiedRaw[1]}`)
        }
        ticketBatchModifiedList = TicketBatch.fromRaws(ticketBatchModifiedRaw[0])
      }
      const ticketBatchModifiedMap = ESArray.arrayToKeyValue(ticketBatchModifiedList, 'id')

      // 6. === UPDATE for PRODUCT and BATCH ===
      const productModifiedList = await this.productManager.changeQuantity({
        manager,
        oid,
        changeList: Object.values(productCalcMap).map((i) => {
          return { productId: i.productId, quantity: i.sumQuantity }
        }),
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const batchModifiedList = await this.batchManager.changeQuantity({
        manager,
        oid,
        changeList: Object.values(batchCalcMap)
          .filter((i) => i.sumQuantity != 0 && i.batchId != 0)
          .map((i) => {
            return { batchId: i.batchId, quantity: i.sumQuantity }
          }),
      })

      // 7. === CALCULATOR: check Negative và tính số lượng ban đầu của product và batch ===
      ticketProductModifiedList.forEach((i) => {
        if (i.quantity < 0) throw new Error(ERROR_LOGIC + JSON.stringify(i))
      })
      ticketBatchModifiedList.forEach((i) => {
        if (i.quantity < 0) throw new Error(ERROR_LOGIC + JSON.stringify(i))
      })
      productModifiedList.forEach((i) => {
        const productCalc = productCalcMap[i.id]
        // sumQuantity là số lượng cộng thật
        productCalc.openQuantity = i.quantity - productCalc.sumQuantity
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []
      returnList.forEach((returnItem) => {
        const { ticketBatchId } = returnItem
        const tbModified = ticketBatchModifiedMap[ticketBatchId]
        const { productId, batchId } = tbModified
        const productCalc = productCalcMap[productId]

        const quantityActual = batchId ? returnItem.quantity : 0

        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.Ticket,
          contactId: tbModified.customerId,
          voucherId: tbModified.ticketId,
          voucherProductId: tbModified.id,
          warehouseId: tbModified.warehouseId,
          productId: tbModified.productId,
          batchId: tbModified.batchId || 0,
          isRefund: 1,
          openQuantity: productCalc.openQuantity,
          quantity: returnItem.quantity, // luôn lấy số lượng trong đơn
          closeQuantity: productCalc.openQuantity + quantityActual, // trừ số lượng còn thực tế
          unitRate: tbModified.unitRate,
          costPrice: tbModified.costPrice,
          expectedPrice: tbModified.expectedPrice,
          actualPrice: tbModified.actualPrice,
          createdAt: time,
        }
        // gán lại số lượng ban đầu vì productMovementInsert đã lấy
        productCalc.openQuantity = productMovementInsert.closeQuantity
        productMovementInsertList.push(productMovementInsert)
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
        ticketUserModifiedList,
        ticketUserDestroyedList,
      }
    })
  }
}
