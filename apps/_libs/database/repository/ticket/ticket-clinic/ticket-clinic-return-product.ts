import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../../common/helpers/object.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, DiscountType, VoucherType } from '../../../common/variable'
import { Batch, Product, Ticket, TicketProduct } from '../../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../../entities/batch-movement.entity'
import ProductMovement, {
  ProductMovementInsertType,
} from '../../../entities/product-movement.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicReturnProduct {
  constructor(private dataSource: DataSource) { }

  async returnProductList(params: {
    oid: number
    ticketId: number
    time: number
    returnList: {
      ticketProductId: number
      quantityReturn: number
      actualPrice: number
      costAmountReturn: number
    }[]
  }) {
    const { oid, ticketId, time, returnList } = params
    const PREFIX = `TicketId = ${ticketId}, Return Product failed`

    if (!returnList.length) {
      throw new Error(`${PREFIX}: returnList.length = 0`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const setTicketOrigin: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } =
      {
        updatedAt: Date.now(),
      }
      // update tạm để tạo transaction
      const ticketOriginUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketOrigin)
        .returning('*')
        .execute()
      if (ticketOriginUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketOrigin = Ticket.fromRaw(ticketOriginUpdateResult.raw[0])

      // const productMoneyReturn = returnList.reduce((acc, item) => {
      //   return acc + item.quantityReturn * item.actualPrice
      // }, 0)
      // const totalCostAmountReturn = returnList.reduce((acc, item) => {
      //   return acc + item.costAmountReturn
      // }, 0)
      // const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
      //   productMoney: () => `"productMoney" - ${productMoneyReturn}`,
      //   totalCostAmount: () => `"totalCostAmount" - ${totalCostAmountReturn}`,
      //   totalMoney: () => `"totalMoney" - ${productMoneyReturn}`,
      //   debt: () => `"debt" - ${productMoneyReturn}`,
      // }
      // const ticketUpdateResult: UpdateResult = await manager
      //   .createQueryBuilder()
      //   .update(Ticket)
      //   .where(whereTicket)
      //   .set(setTicket)
      //   .returning('*')
      //   .execute()
      // if (ticketUpdateResult.affected != 1) {
      //   throw new Error(`${PREFIX}: Update Ticket failed`)
      // }
      // const ticket = Ticket.fromRaw(ticketUpdateResult.raw[0])

      // === 2. UPDATE for VISIT_PRODUCT ===
      const ticketProductUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE  "TicketProduct" tp
        SET     "costAmount"      = tp."costAmount" - temp."costAmountReturn",
                "quantity"        = tp."quantity" - temp."quantityReturn",
                "quantityReturn"  = tp."quantityReturn" + temp."quantityReturn",
                "deliveryStatus"  = CASE 
                                      WHEN  (tp."quantity" = temp."quantityReturn") 
                                        THEN ${DeliveryStatus.NoStock} 
                                      ELSE ${DeliveryStatus.Delivered} 
                                    END
        FROM (VALUES `
        + returnList
          .map((i) => `(${i.ticketProductId}, ${i.quantityReturn}, ${i.costAmountReturn})`)
          .join(', ')
        + `   ) AS temp("ticketProductId", "quantityReturn", "costAmountReturn"
                        )
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
      const productIdMapValue: Record<
        string,
        {
          quantityReturn: number
          costAmountReturn: number
          openQuantity: number
          openCostAmount: number
          hasManageQuantity: 0 | 1
        }
      > = {}
      const batchIdMapValue: Record<string, { quantityReturn: number; openQuantity: number }> = {}
      for (let i = 0; i < returnList.length; i++) {
        const { quantityReturn, costAmountReturn, ticketProductId } = returnList[i]
        const { productId, batchId } = ticketProductActionedMap[ticketProductId]

        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantityReturn: 0,
            costAmountReturn: 0,
            openQuantity: 0,
            openCostAmount: 0,
            hasManageQuantity: 1,
          }
        }
        productIdMapValue[productId].quantityReturn += quantityReturn
        productIdMapValue[productId].costAmountReturn += costAmountReturn

        if (batchId != 0) {
          if (!batchIdMapValue[batchId]) {
            batchIdMapValue[batchId] = { quantityReturn: 0, openQuantity: 0 }
          }
          batchIdMapValue[batchId].quantityReturn += quantityReturn
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      const productIdEntriesQuantity = Object.entries(productIdMapValue)
      if (productIdEntriesQuantity.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity"    = CASE 
                                  WHEN  (product."hasManageQuantity" = 0) THEN 0 
                                  ELSE "product"."quantity" + temp."quantityReturn"
                              END,
              "costAmount"  = CASE 
                                  WHEN  (product."hasManageQuantity" = 0) THEN 0 
                                  ELSE "product"."costAmount" + temp."costAmountReturn"
                              END
          FROM (VALUES `
          + productIdEntriesQuantity
            .map(([productId, sl]) => {
              return `(${productId}, ${sl.quantityReturn}, ${sl.costAmountReturn})`
            })
            .join(', ')
          + `   ) AS temp("productId", "quantityReturn", "costAmountReturn")
          WHERE   "product"."oid" = ${oid}
              AND "product"."id" = temp."productId"
          RETURNING "product".*;
          `
        )
        if (productUpdateResult[1] != productIdEntriesQuantity.length) {
          throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
        }
        productList = Product.fromRaws(productUpdateResult[0])
      }
      const productMap = arrayToKeyValue(productList, 'id')

      // 6. === UPDATE for BATCH ===
      let batchList: Batch[] = []
      const batchIdEntriesQuantity = Object.entries(batchIdMapValue)

      if (batchIdEntriesQuantity.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" + temp."quantityReturn"
          FROM (VALUES `
          + batchIdEntriesQuantity
            .map(([batchId, sl]) => `(${batchId}, ${sl.quantityReturn})`)
            .join(', ')
          + `   ) AS temp("batchId", "quantityReturn")
          WHERE   "batch"."oid" = ${oid}
              AND "batch"."id" = temp."batchId"
          RETURNING "batch".*;
          `
        )
        if (batchUpdateResult[1] != batchIdEntriesQuantity.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])

        // Nhập lại thuốc thì luôn tính lại HSD, vì thông tin phiếu không có HSD, nên cần phải tính lại hết
        if (batchList.length) {
          const productReCalculatorIds = batchList.map((i) => i.productId)
          const productReCalculatorResult: [any[], number] = await manager.query(`
              UPDATE "Product" product
              SET "expiryDate" = (
                  SELECT MIN("expiryDate")
                  FROM "Batch" batch
                  WHERE   batch."productId" = product.id
                      AND batch."expiryDate" IS NOT NULL
                      AND batch."quantity" <> 0
              )
              WHERE product."hasManageBatches" = 1
                  AND "product"."id" IN (${productReCalculatorIds.toString()})
              RETURNING "product".*;  
          `)
          const productReCalculatorList = Product.fromRaws(productReCalculatorResult[0])
          for (let i = 0; i < productList.length; i++) {
            const productId = productList[i].id
            const productReCalculatorFind = productReCalculatorList.find((i) => {
              return i.id === productId
            })
            if (productReCalculatorFind) {
              productList[i] = productReCalculatorFind
            }
          }
        }
      }

      // 7. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMapValue[i.id]
        currentMap.hasManageQuantity = i.hasManageQuantity
        if (currentMap.hasManageQuantity == 0) {
          currentMap.openQuantity = 0
          currentMap.openCostAmount = 0
          currentMap.quantityReturn = 0
          currentMap.costAmountReturn = 0
        } else {
          currentMap.openQuantity = i.quantity - currentMap.quantityReturn
          currentMap.openCostAmount = i.costAmount - currentMap.costAmountReturn
        }
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantityReturn
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft = ticketProductActionedList.map((ticketProductActioned) => {
        const currentMap = productIdMapValue[ticketProductActioned.productId]
        if (!currentMap) {
          throw new Error(`${PREFIX}: Not found movement with ${ticketProductActioned.productId}`)
        }
        const currentReturn = returnList.find((i) => i.ticketProductId === ticketProductActioned.id)
        // không lấy quantity theo currentMap được vì nó đã bị group nhiều record theo productId
        // không lấy quantity theo ticketProductActioned được, vì nó có thể trả 1 nửa hay gì gì đó
        // phải lấy quantity theo currentReturn
        const quantityReturn = currentMap.hasManageQuantity ? currentReturn.quantityReturn : 0
        const costAmountReturn = currentMap.hasManageQuantity ? currentReturn.costAmountReturn : 0

        const draft: ProductMovementInsertType = {
          oid,
          productId: ticketProductActioned.productId,
          voucherId: ticketId,
          contactId: ticketOrigin.customerId,
          voucherType: VoucherType.Ticket,
          isRefund: 1,
          createdAt: time,
          unitRate: ticketProductActioned.unitRate,
          actualPrice: ticketProductActioned.actualPrice,
          expectedPrice: ticketProductActioned.expectedPrice,
          openQuantity: currentMap.openQuantity,
          quantity: currentReturn.quantityReturn,
          closeQuantity: currentMap.openQuantity + quantityReturn, // cộng hoặc trừ theo số lượng thực tế
          openCostAmount: currentMap.openCostAmount,
          costAmount: currentReturn.costAmountReturn,
          closeCostAmount: currentMap.openCostAmount + costAmountReturn,
        }

        // sau khi lấy rồi cần cập nhật currentMap vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
        currentMap.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy

        return draft
      })
      if (productMovementListDraft.length) {
        await manager.insert(ProductMovement, productMovementListDraft)
      }

      // 10. === CREATE: BATCH_MOVEMENT ===
      const batchMovementsDraft = ticketProductActionedList
        .filter((i) => i.batchId !== 0)
        .map((ticketProductActioned) => {
          const currentMap = batchIdMapValue[ticketProductActioned.batchId]
          if (!currentMap) {
            throw new Error(`${PREFIX}: Not found movement with ${ticketProductActioned.productId}`)
          }
          const currentReturn = returnList.find(
            (i) => i.ticketProductId === ticketProductActioned.id
          )
          // không lấy theo currentMap được vì nó đã bị group nhiều record theo productId
          const quantityReturn = currentReturn.quantityReturn

          const draft: BatchMovementInsertType = {
            oid,
            productId: ticketProductActioned.productId,
            batchId: ticketProductActioned.batchId,
            voucherId: ticketId,
            contactId: ticketOrigin.customerId,
            voucherType: VoucherType.Ticket,
            isRefund: 1,
            createdAt: time,
            unitRate: ticketProductActioned.unitRate,
            actualPrice: ticketProductActioned.actualPrice,
            expectedPrice: ticketProductActioned.expectedPrice,
            openQuantity: currentMap.openQuantity,
            quantity: quantityReturn,
            closeQuantity: currentMap.openQuantity + quantityReturn,
          }
          // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy

          return draft
        })
      if (batchMovementsDraft.length) {
        await manager.insert(BatchMovement, batchMovementsDraft)
      }

      // === 11. QUERY NEW ===
      const ticketProductList = await manager.find(TicketProduct, {
        relations: { product: true, batch: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })

      const productMoney = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmount = ticketProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      const itemsActualMoney =
        ticketOrigin.itemsActualMoney - ticketOrigin.productMoney + productMoney

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoney == 0 ? 0 : Math.floor((discountMoney * 100) / itemsActualMoney)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoney) / 100)
      }
      const totalMoney = itemsActualMoney - discountMoney

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        productMoney,
        totalCostAmount,
        itemsActualMoney,
        discountPercent,
        discountMoney,
        totalMoney,
        debt: () => `${totalMoney} - "paid"`,
      }

      const ticketUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketBasic = Ticket.fromRaw(ticketUpdateResult.raw[0])

      return {
        ticketBasic,
        productList,
        batchList,
        ticketProductList,
      }
    })
  }
}
