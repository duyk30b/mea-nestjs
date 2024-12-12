import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DeliveryStatus, DiscountType, MovementType } from '../../common/variable'
import { Batch, Product, TicketProduct } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { ProductMovementManager, TicketManager, TicketProductManager } from '../../managers'

@Injectable()
export class TicketClinicReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private productMovementManager: ProductMovementManager,
    private ticketProductManager: TicketProductManager
  ) { }

  async start(params: {
    oid: number
    ticketId: number
    time: number
    returnList: {
      ticketProductId: number
      quantityReturn: number
    }[]
  }) {
    const { oid, ticketId, time, returnList } = params
    const PREFIX = `TicketId = ${ticketId}, Return Product failed`

    if (!returnList.length) {
      throw new Error(`${PREFIX}: returnList.length = 0`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Executing] },
        },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE for TICKET_PRODUCT ===
      const ticketProductUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE  "TicketProduct" tp
        SET     "quantity"        = tp."quantity" - temp."quantityReturn",
                "deliveryStatus"  = CASE 
                                      WHEN  (tp."quantity" = temp."quantityReturn") 
                                        THEN ${DeliveryStatus.NoStock} 
                                      ELSE ${DeliveryStatus.Delivered} 
                                    END
        FROM (VALUES `
        + returnList.map((i) => `(${i.ticketProductId}, ${i.quantityReturn})`).join(', ')
        + `   ) AS temp("ticketProductId", "quantityReturn")
        WHERE   tp."oid"            = ${oid}
            AND tp."ticketId"       = ${ticketId}
            AND tp."id"             = temp."ticketProductId"
            AND tp."deliveryStatus" = ${DeliveryStatus.Delivered}
        RETURNING tp.*;
        `
      )
      if (ticketProductUpdateResult[0].length != returnList.length) {
        throw new Error(
          `${PREFIX}: Update TicketProduct, affected = ${ticketProductUpdateResult[1]}`
        )
      }
      const ticketProductActionedList = TicketProduct.fromRaws(ticketProductUpdateResult[0])
      const ticketProductActionedMap = arrayToKeyValue(ticketProductActionedList, 'id')
      ticketProductActionedList.forEach((i) => {
        if (i.quantity < 0) {
          throw new Error(`Số lượng trả vượt quá số lượng mua hàng`)
        }
      })

      // === 3. CALCULATOR: số lượng RETURN của product và batch ===
      // Có 2 trường hợp không làm thay đổi số lượng
      // --1. Sản phẩm có hasManageQuantity = 0
      // --2. Đơn hàng tạo tại thời điểm sản phẩm không quản lý số lượng => batchId = 0
      const productCalculatorMap: Record<
        string,
        {
          openQuantity: number
          quantityGroupSend: number
          allowChangeQuantity: boolean
        }
      > = {}
      const batchCalculatorMap: Record<
        string,
        {
          quantityGroupSend: number
          openQuantity: number
        }
      > = {}
      for (let i = 0; i < returnList.length; i++) {
        const { quantityReturn, ticketProductId } = returnList[i]
        const { productId, batchId } = ticketProductActionedMap[ticketProductId]

        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            openQuantity: 0,
            quantityGroupSend: 0,
            allowChangeQuantity: true,
          }
        }

        if (batchId == 0) {
          // với batchId = 0 thì thuộc trường hợp không quản lý số lượng tồn kho
          productCalculatorMap[productId].allowChangeQuantity = false
        } else {
          productCalculatorMap[productId].quantityGroupSend += quantityReturn
          if (!batchCalculatorMap[batchId]) {
            batchCalculatorMap[batchId] = { quantityGroupSend: 0, openQuantity: 0 }
          }
          batchCalculatorMap[batchId].quantityGroupSend += quantityReturn
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      const productCalculatorEntries = Object.entries(productCalculatorMap)
      if (productCalculatorEntries.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity"    = CASE 
                                  WHEN (product."hasManageQuantity" = 0) THEN "product"."quantity" 
                                  ELSE "product"."quantity" + temp."quantityGroupSend"
                              END
          FROM (VALUES `
          + productCalculatorEntries
            .map(([productId, calc]) => `(${productId}, ${calc.quantityGroupSend})`)
            .join(', ')
          + `   ) AS temp("productId", "quantityGroupSend")
          WHERE   "product"."oid" = ${oid}
              AND "product"."id" = temp."productId"
          RETURNING "product".*;
          `
        )
        if (productUpdateResult[1] != productCalculatorEntries.length) {
          throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
        }
        productList = Product.fromRaws(productUpdateResult[0])
      }

      // 6. === UPDATE for BATCH ===
      let batchList: Batch[] = []
      const batchCalculatorList = Object.entries(batchCalculatorMap)

      if (batchCalculatorList.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" + temp."quantityGroupSend"
          FROM (VALUES `
          + batchCalculatorList
            .map(([batchId, sl]) => `(${batchId}, ${sl.quantityGroupSend})`)
            .join(', ')
          + `   ) AS temp("batchId", "quantityGroupSend")
          WHERE   "batch"."oid" = ${oid}
              AND "batch"."id" = temp."batchId"
          RETURNING "batch".*;
          `
        )
        if (batchUpdateResult[1] != batchCalculatorList.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // 7. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        if (!i.hasManageQuantity) {
          productCalculator.allowChangeQuantity = false //  product đã được cập nhật là không quản lý số lượng nữa
          productCalculator.quantityGroupSend = 0
        }
        productCalculator.openQuantity = i.quantity - productCalculator.quantityGroupSend
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity = i.quantity - batchCalculator.quantityGroupSend
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList = ticketProductActionedList.map((ticketProductActioned) => {
        const productCalculator = productCalculatorMap[ticketProductActioned.productId]
        if (!productCalculator) {
          throw new Error(`${PREFIX}: Not found movement with ${ticketProductActioned.productId}`)
        }
        const currentReturn = returnList.find((i) => {
          return i.ticketProductId === ticketProductActioned.id
        })
        // không lấy quantity theo productCalculator được vì nó đã bị group nhiều record theo productId
        // không lấy quantity theo ticketProductActioned được, vì nó có thể trả 1 nửa hay gì gì đó
        // phải lấy quantity theo currentReturn
        const quantityReturn = productCalculator.allowChangeQuantity
          ? currentReturn.quantityReturn
          : 0

        const productMovementInsert: ProductMovementInsertType = {
          oid,
          warehouseId: ticketProductActioned.warehouseId,
          productId: ticketProductActioned.productId,
          voucherId: ticketId,
          contactId: ticketOrigin.customerId,
          movementType: MovementType.Ticket,
          isRefund: 1,
          createdAt: time,
          unitRate: ticketProductActioned.unitRate,
          costPrice: ticketProductActioned.costPrice,
          actualPrice: ticketProductActioned.actualPrice,
          expectedPrice: ticketProductActioned.expectedPrice,
          openQuantity: productCalculator.openQuantity,
          quantity: currentReturn.quantityReturn,
          closeQuantity: productCalculator.openQuantity + quantityReturn, // cộng hoặc trừ theo số lượng thực tế
        }

        // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì productMovementInsert đã lấy

        return productMovementInsert
      })
      if (productMovementInsertList.length) {
        await this.productMovementManager.insertMany(manager, productMovementInsertList)
      }

      // 10. === CREATE: BATCH_MOVEMENT ===
      const batchMovementInsertList = ticketProductActionedList
        .filter((i) => i.batchId !== 0)
        .map((ticketProductActioned) => {
          const batchCalculator = batchCalculatorMap[ticketProductActioned.batchId]
          if (!batchCalculator) {
            throw new Error(`${PREFIX}: Not found movement with ${ticketProductActioned.productId}`)
          }
          const currentReturn = returnList.find(
            (i) => i.ticketProductId === ticketProductActioned.id
          )
          // không lấy theo batchCalculator được vì nó đã bị group nhiều record theo productId
          const quantityReturn = currentReturn.quantityReturn

          const batchMovementInsert: BatchMovementInsertType = {
            oid,
            warehouseId: ticketProductActioned.warehouseId,
            productId: ticketProductActioned.productId,
            batchId: ticketProductActioned.batchId,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            movementType: MovementType.Ticket,
            isRefund: 1,
            createdAt: time,
            unitRate: ticketProductActioned.unitRate,
            actualPrice: ticketProductActioned.actualPrice,
            expectedPrice: ticketProductActioned.expectedPrice,
            openQuantity: batchCalculator.openQuantity,
            quantity: quantityReturn,
            closeQuantity: batchCalculator.openQuantity + quantityReturn,
          }
          // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          batchCalculator.openQuantity = batchMovementInsert.closeQuantity // gán lại số lượng ban đầu vì batchMovementInsert đã lấy

          return batchMovementInsert
        })
      if (batchMovementInsertList.length) {
        await manager.insert(BatchMovement, batchMovementInsertList)
      }

      // === 11. UPDATE TICKET: product money ===
      const returnMap = arrayToKeyValue(returnList, 'ticketProductId')
      const productMoneyReturn = ticketProductActionedList.reduce((acc, item) => {
        return acc + item.actualPrice * returnMap[item.id].quantityReturn
      }, 0)
      const productDiscountReturn = ticketProductActionedList.reduce((acc, item) => {
        return acc + item.discountMoney * returnMap[item.id].quantityReturn
      }, 0)
      const totalCostAmountReturn = ticketProductActionedList.reduce((acc, item) => {
        return acc + item.costPrice * returnMap[item.id].quantityReturn
      }, 0)

      const productMoneyUpdate = ticketOrigin.productMoney - productMoneyReturn
      const totalCostAmountUpdate = ticketOrigin.totalCostAmount - totalCostAmountReturn
      const itemsActualMoneyUpdate = ticketOrigin.itemsActualMoney - productMoneyReturn
      const itemsDiscountUpdate = ticketOrigin.itemsDiscount - productDiscountReturn

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoneyUpdate == 0
            ? 0
            : Math.floor((discountMoney * 100) / itemsActualMoneyUpdate)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoneyUpdate) / 100)
      }
      const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Executing] },
        },
        {
          productMoney: productMoneyUpdate,
          totalCostAmount: totalCostAmountUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          itemsDiscount: itemsDiscountUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
        }
      )

      return {
        ticket,
        productList,
        batchList,
      }
    })
  }
}
