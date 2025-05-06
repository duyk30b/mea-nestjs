import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { Batch, Product, TicketBatch, TicketProduct, TicketUser } from '../../entities'
import { InteractType } from '../../entities/commission.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
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
    // bắt buộc cần trả theo ticketProduct vì có trường hợp !hasInventoryImpact
    tpReturnList: {
      ticketProductId: number
      productId: number
      quantityReturn: number
      costAmount?: number // để type để xử lý, bên service ko cần truyền sang
      // tbReturnList: any[] // xử lý sau,
    }[]
  }) {
    const { oid, ticketId, time, tpReturnList } = params
    const PREFIX = `TicketId = ${ticketId}, returnProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, returnProduct has a logic error occurred: `

    if (!tpReturnList.length) {
      throw new Error(`${PREFIX}: tpReturnList.length = 0`)
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

      // 2. === TICKET_PRODUCT: chủ yếu lấy hasInventoryImpact ===
      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: tpReturnList.map((i) => i.ticketProductId) },
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // 3. === PRODUCT CALCULATOR: nhiều ticketProduct trùng productId nên cần gộp số lượng lại ===
      const productCalculatorMap: Record<
        string,
        {
          productId: number
          openQuantity: number
          sumQuantityReturn: number
          hasInventoryImpact: 0 | 1
        }
      > = {}
      for (let i = 0; i < tpReturnList.length; i++) {
        const tpReturn = tpReturnList[i]
        const { productId, quantityReturn, ticketProductId } = tpReturn

        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            productId,
            openQuantity: 0,
            sumQuantityReturn: 0,
            hasInventoryImpact: 0,
          }
        }

        const tpOrigin = ticketProductOriginMap[ticketProductId]
        if (tpOrigin.hasInventoryImpact) {
          productCalculatorMap[productId].hasInventoryImpact = 1
          productCalculatorMap[productId].sumQuantityReturn += quantityReturn
        }
      }

      // 4. === UPDATE for PRODUCT ===
      const productCalculatorValues = Object.values(productCalculatorMap)
      const productModifiedRaw: [any[], number] = await manager.query(
        `
          UPDATE "Product" AS "product"
          SET "quantity"    = "product"."quantity" + temp."sumQuantityReturn"
          FROM (VALUES `
        + productCalculatorValues
          .map((calc) => `(${calc.productId}, ${calc.sumQuantityReturn})`)
          .join(', ')
        + `   ) AS temp("productId", "sumQuantityReturn")
          WHERE   "product"."oid" = ${oid}
              AND "product"."id" = temp."productId"
          RETURNING "product".*;
          `
      )
      if (productModifiedRaw[0].length != productCalculatorValues.length) {
        throw new Error(`${PREFIX}: Update Product, affected = ${productModifiedRaw[1]}`)
      }
      const productModifiedList = Product.fromRaws(productModifiedRaw[0])
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      // 5. === TICKET_BATCH: CALCULATOR===
      const ticketBatchListOrigin = await this.ticketBatchManager.findManyBy(manager, {
        oid,
        ticketId,
        quantity: { GT: 0 },
        deliveryStatus: DeliveryStatus.Delivered,
        ticketProductId: { IN: tpReturnList.map((i) => i.ticketProductId) },
      })
      const tbReturnList: {
        ticketProductId: number
        ticketBatchId: number
        batchId: number
        productId: number
        quantityReturn: number
      }[] = []

      tpReturnList.forEach((tpr) => {
        const tpOrigin = ticketProductOriginMap[tpr.ticketProductId]
        if (!tpOrigin.hasInventoryImpact) {
          // vẫn cần phải tính costAmount với những đơn hàng không trừ kho, nhưng phải tính mới ra
          tpr.costAmount = productModifiedMap[tpr.productId].costPrice * tpr.quantityReturn
          return
        }

        let quantityReturn = tpr.quantityReturn
        const tbCurrentProduct = ticketBatchListOrigin.filter((i) => {
          return i.ticketProductId === tpr.ticketProductId
        })
        for (let i = 0; i < tbCurrentProduct.length; i++) {
          const ticketBatch = tbCurrentProduct[i]
          const quantityGet = Math.min(quantityReturn, ticketBatch.quantity)
          if (quantityGet <= 0) break
          tbReturnList.push({
            ticketProductId: ticketBatch.ticketProductId,
            ticketBatchId: ticketBatch.id,
            batchId: ticketBatch.batchId,
            productId: ticketBatch.productId,
            quantityReturn: quantityGet,
          })
          // tính costAmount trả về cho ticketProduct
          if (!tpr.costAmount) tpr.costAmount = 0
          tpr.costAmount = tpr.costAmount + ticketBatch.costPrice * quantityGet

          quantityReturn = quantityReturn - quantityGet
        }
        if (quantityReturn > 0) {
          throw new Error(ERROR_LOGIC + JSON.stringify(tpr))
        }
      })

      // 6. === UPDATE for TICKET_PRODUCT ===
      const ticketProductModifiedRaw = await manager.query(
        `
        UPDATE  "TicketProduct" tp
        SET     "quantity"          = tp."quantity" - temp."quantityReturn",
                "costAmount"        = tp."costAmount" - temp."costAmount",
                "deliveryStatus"    = CASE
                                        WHEN  (tp."quantity" = temp."quantityReturn")
                                          THEN ${DeliveryStatus.NoStock}
                                        ELSE ${DeliveryStatus.Delivered}
                                      END
        FROM (VALUES `
        + tpReturnList
          .map((i) => {
            return `(${i.ticketProductId}, ${i.productId}, ${i.quantityReturn}, ${i.costAmount})`
          })
          .join(', ')
        + `   ) AS temp("ticketProductId", "productId", "quantityReturn", "costAmount")
        WHERE   tp."oid"            = ${oid}
            AND tp."ticketId"       = ${ticketId}
            AND tp."id"             = temp."ticketProductId"
            AND tp."productId"      = temp."productId"
        RETURNING tp.*;
        `
      )
      if (ticketProductModifiedRaw[0].length != tpReturnList.length) {
        throw new Error(
          `${PREFIX}: Update TicketProduct, affected = ${ticketProductModifiedRaw[1]}`
        )
      }
      const ticketProductModifiedList = TicketProduct.fromRaws(ticketProductModifiedRaw[0])
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 7. === TICKET_BATCH: UPDATE ===
      let ticketBatchModifiedList: TicketBatch[] = []
      if (tbReturnList.length) {
        const ticketBatchModifiedRaw: [any[], number] = await manager.query(
          `
          UPDATE  "TicketBatch" tb
          SET     "quantity"        = tb."quantity" - temp."quantityReturn",
                  "deliveryStatus"  = CASE 
                                        WHEN  (tb."quantity" = temp."quantityReturn") 
                                          THEN ${DeliveryStatus.NoStock} 
                                        ELSE ${DeliveryStatus.Delivered} 
                                      END
          FROM (VALUES `
          + tbReturnList.map((i) => `(${i.ticketBatchId}, ${i.quantityReturn})`).join(', ')
          + `   ) AS temp("ticketBatchId", "quantityReturn")
          WHERE   tb."oid"                = ${oid}
                  AND tb."ticketId"       = ${ticketId}
                  AND tb."id"             = temp."ticketBatchId"
                  AND tb."deliveryStatus" = ${DeliveryStatus.Delivered}
          RETURNING tb.*;
          `
        )
        if (ticketBatchModifiedRaw[0].length != tbReturnList.length) {
          throw new Error(`${PREFIX}: Update TicketBatch, affected = ${ticketBatchModifiedRaw[1]}`)
        }
        ticketBatchModifiedList = TicketBatch.fromRaws(ticketBatchModifiedRaw[0])
      }
      const ticketBatchModifiedMap = ESArray.arrayToKeyValue(ticketBatchModifiedList, 'id')
      ticketBatchModifiedList.forEach((i) => {
        if (i.quantity < 0) {
          throw new Error(ERROR_LOGIC + JSON.stringify(i))
        }
      })

      // 8. === BATCH CALCULATOR: nhiều ticketBatch trùng batchId nên cần gộp số lượng lại ===
      const batchCalculatorMap: Record<
        string,
        {
          batchId: number
          productId: number
          sumQuantityReturn: number
        }
      > = {}
      for (let i = 0; i < tbReturnList.length; i++) {
        const { batchId, productId, quantityReturn } = tbReturnList[i]

        if (!batchCalculatorMap[batchId]) {
          batchCalculatorMap[batchId] = {
            productId,
            batchId,
            sumQuantityReturn: 0,
          }
        }
        batchCalculatorMap[batchId].sumQuantityReturn += quantityReturn
      }

      // 9. === BATCH: UPDATE ===
      const batchCalculatorValues = Object.values(batchCalculatorMap)
      if (batchCalculatorValues.length) {
        const batchModifiedListRaw: [any[], number] = await manager.query(
          `
        UPDATE "Batch" "batch"
        SET "quantity" = "batch"."quantity" + temp."sumQuantityReturn"
        FROM (VALUES `
          + batchCalculatorValues
            .map((calc) => `(${calc.batchId}, ${calc.sumQuantityReturn})`)
            .join(', ')
          + `   ) AS temp("batchId", "sumQuantityReturn")
        WHERE   "batch"."oid" = ${oid}
            AND "batch"."id" = temp."batchId"
        RETURNING "batch".*;
      `
        )
        if (batchModifiedListRaw[0].length != batchCalculatorValues.length) {
          throw new Error('Lô hàng xuất cho phiếu này đã bị xóa, không thể hoàn trả')
          // throw new Error(`${PREFIX}: Update Batch, affected = ${batchModifiedListRaw[1]}`)
        }
        const batchModifiedList = Batch.fromRaws(batchModifiedListRaw[0])
        const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')
      }
      // 10. === CALCULATOR: số lượng ban đầu của product ===
      productModifiedList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        if (!i.hasManageQuantity) {
          // những product không quản lý số lượng thì không bị cập nhật
          productCalculator.openQuantity = i.quantity - 0
        } else {
          productCalculator.openQuantity = i.quantity - productCalculator.sumQuantityReturn
        }
      })

      // 11. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []
      tpReturnList.map((tpReturn) => {
        const productCalculator = productCalculatorMap[tpReturn.productId]
        const tpAction = ticketProductModifiedMap[tpReturn.ticketProductId]
        // có trừ kho thì ghi nhiều bản ghi phụ thuộc vào số lượng ticketBatch
        if (tpAction.hasInventoryImpact) {
          tbReturnList
            .filter((i) => i.ticketProductId === tpReturn.ticketProductId)
            .forEach((tbReturn) => {
              const tbAction = ticketBatchModifiedMap[tbReturn.ticketBatchId]
              const productMovementInsert: ProductMovementInsertType = {
                oid,
                movementType: MovementType.Ticket,
                contactId: tbAction.customerId,
                voucherId: tbAction.ticketId,
                voucherProductId: tbAction.id,
                warehouseId: tbAction.warehouseId,
                productId: tbAction.productId,
                batchId: tbAction.batchId,
                isRefund: 1,
                openQuantity: productCalculator.openQuantity,
                quantity: tbReturn.quantityReturn, // luôn lấy số lượng trong đơn
                closeQuantity: productCalculator.openQuantity + tbReturn.quantityReturn,
                unitRate: tbAction.unitRate,
                costPrice: tbAction.costPrice,
                expectedPrice: tbAction.expectedPrice,
                actualPrice: tbAction.actualPrice,
                createdAt: time,
              }
              productCalculator.openQuantity = productMovementInsert.closeQuantity
              productMovementInsertList.push(productMovementInsert)
            })
        }

        if (!tpAction.hasInventoryImpact) {
          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Ticket,
            contactId: tpAction.customerId,
            voucherId: tpAction.ticketId,
            voucherProductId: tpAction.id,
            warehouseId: tpAction.warehouseId,
            productId: tpAction.productId,
            batchId: 0,
            isRefund: 1,
            openQuantity: productCalculator.openQuantity,
            quantity: tpReturn.quantityReturn,
            closeQuantity: productCalculator.openQuantity + 0, // cộng với 0 do !hasInventoryImpact
            unitRate: tpAction.unitRate,
            costPrice: tpAction.costAmount, // đã được tính toán ở trên
            actualPrice: tpAction.actualPrice,
            expectedPrice: tpAction.expectedPrice,
            createdAt: time,
          }

          // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì productMovementInsert đã lấy
          productMovementInsertList.push(productMovementInsert)
        }
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      // 12. === TICKET_USER and COMMISSION
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

      // 13. === UPDATE TICKET: product money ===
      const productMoneyReturn = tpReturnList.reduce((acc, item) => {
        const tpOrigin = ticketProductOriginMap[item.ticketProductId]
        const tpModified = ticketProductModifiedMap[item.ticketProductId]
        return (
          acc
          + tpOrigin.actualPrice * tpOrigin.quantity
          - tpModified.actualPrice * tpModified.quantity
        )
      }, 0)
      const productDiscountReturn = tpReturnList.reduce((acc, item) => {
        const tpOrigin = ticketProductOriginMap[item.ticketProductId]
        const tpModified = ticketProductModifiedMap[item.ticketProductId]
        return (
          acc
          + tpOrigin.discountMoney * tpOrigin.quantity
          - tpModified.discountMoney * tpModified.quantity
        )
      }, 0)
      const itemsCostAmountReturn = tpReturnList.reduce((acc, item) => {
        const tpOrigin = ticketProductOriginMap[item.ticketProductId]
        const tpModified = ticketProductModifiedMap[item.ticketProductId]
        return acc + tpOrigin.costAmount - tpModified.costAmount
      }, 0)

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
