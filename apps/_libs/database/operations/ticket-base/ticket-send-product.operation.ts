import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { Batch, Product, TicketProduct } from '../../entities'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketBatchInsertType } from '../../entities/ticket-batch.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  BatchManager,
  ProductMovementManager,
  TicketBatchManager,
  TicketManager,
  TicketProductManager,
} from '../../managers'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

@Injectable()
export class TicketSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private batchManager: BatchManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private productMovementManager: ProductMovementManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async sendProduct(params: { oid: number; ticketId: number; time: number }) {
    const { oid, ticketId, time } = params
    const PREFIX = `TicketId = ${ticketId}, sendProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, sendProduct has a logic error occurred: `

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: {
            IN: [TicketStatus.Draft, TicketStatus.Prepayment, TicketStatus.Executing],
          },
        },
        { updatedAt: Date.now(), ticketStatus: TicketStatus.Executing }
      )

      // 2. === TICKET_PRODUCT: chủ yếu lấy hasInventoryImpact ===
      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
        quantity: { GT: 0 },
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // 3. === CALCULATOR: lấy tổng số lượng của product (có thể nhiều record trùng product) ===
      const productCalculatorMap: Record<
        string,
        {
          productId: number
          openQuantity: number
          sumQuantitySend: number
          hasInventoryImpact: 0 | 1
        }
      > = {}
      for (let i = 0; i < ticketProductOriginList.length; i++) {
        const tpOrigin = ticketProductOriginList[i]
        const { productId } = tpOrigin
        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            productId,
            openQuantity: 0,
            sumQuantitySend: 0,
            hasInventoryImpact: 0,
          }
        }
        if (tpOrigin.hasInventoryImpact) {
          // nếu có 1 thằng có trừ vào kho số lượng thì tính thôi
          productCalculatorMap[productId].hasInventoryImpact = 1
          productCalculatorMap[productId].sumQuantitySend += tpOrigin.quantity
        }
      }

      // 4. === UPDATE for PRODUCT ===
      const productCalculatorValues = Object.values(productCalculatorMap)
      // nếu "hasManageQuantity" = 0 đều không gây thay đổi số lượng
      const productModifiedRaw: [any[], number] = await manager.query(
        `
        UPDATE "Product" AS "product"
        SET "quantity"    = "product"."quantity" - temp."sumQuantitySend"
        FROM (VALUES `
        + productCalculatorValues
          .map((calc) => `(${calc.productId}, ${calc.sumQuantitySend})`)
          .join(', ')
        + `   ) AS temp("productId", "sumQuantitySend")
        WHERE   "product"."id" = temp."productId" 
            AND "product"."oid" = ${oid} 
        RETURNING "product".*;   
        `
      )
      if (productModifiedRaw[0].length != productCalculatorValues.length) {
        throw new Error(`${PREFIX}: Update Product failed, ${JSON.stringify(productModifiedRaw)}`)
      }
      const productModifiedList = Product.fromRaws(productModifiedRaw[0])
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')
      productModifiedList.forEach((i) => {
        if (i.quantity < 0) {
          throw new Error(`Sản phẩm ${i.brandName} không đủ số lượng tồn kho`)
        }
      })

      // 5. === UPDATE Batch tạo transaction ===
      const batchListOrigin = await this.batchManager.updateAndReturnEntity(
        manager,
        {
          oid,
          productId: { IN: productModifiedList.map((i) => i.id) },
          quantity: { GT: 0 },
        },
        { updatedAt: Date.now() }
      )

      // 6. === CALCULATOR: tạo map theo productId, list các Batch cùng số lượng theo registeredAt tăng dần ===
      const batchListMapRemain: Record<string, { quantityRemain: number; batch: Batch }[]> = {}
      batchListOrigin.forEach((b) => {
        batchListMapRemain[b.productId] ||= []
        batchListMapRemain[b.productId].push({
          quantityRemain: b.quantity,
          batch: b,
        })
      })
      Object.keys(batchListMapRemain).forEach((productId) => {
        batchListMapRemain[productId].sort((a, b) => {
          return a.batch.registeredAt < b.batch.registeredAt ? -1 : 1
        })
      })

      // 7. === INSERT TicketBatch
      const ticketBatchInsertList: TicketBatchInsertType[] = []
      ticketProductOriginList
        .filter((tpOrigin) => tpOrigin.hasInventoryImpact && tpOrigin.quantity)
        .forEach((tpOrigin) => {
          let quantitySend = tpOrigin.quantity
          const batchListRemain = batchListMapRemain[tpOrigin.productId].filter((i) => {
            if (tpOrigin.warehouseId === 0) return true // không chọn kho thì lấy tất
            if (i.batch.warehouseId === 0) return true // để ở kho tự do cũng lấy
            if (i.batch.warehouseId === tpOrigin.warehouseId) return true // lấy chính xác trong kho đó
            return false
          })
          for (let i = 0; i < batchListRemain.length; i++) {
            const batch = batchListRemain[i].batch
            const quantityGet = Math.min(quantitySend, batchListRemain[i].quantityRemain)
            const ticketBatchInsert: TicketBatchInsertType = {
              oid: tpOrigin.oid,
              ticketId: tpOrigin.ticketId,
              customerId: tpOrigin.customerId,
              ticketProductId: tpOrigin.id,
              warehouseId: batch.warehouseId,
              productId: tpOrigin.productId,
              batchId: batch.id,
              deliveryStatus: DeliveryStatus.Delivered,
              unitRate: tpOrigin.unitRate,
              quantity: quantityGet,
              costPrice: batch.costPrice,
              actualPrice: tpOrigin.actualPrice,
              expectedPrice: tpOrigin.expectedPrice,
            }
            ticketBatchInsertList.push(ticketBatchInsert)

            quantitySend = quantitySend - quantityGet
            batchListRemain[i].quantityRemain = batchListRemain[i].quantityRemain - quantityGet
            if (quantitySend <= 0) break
          }
          if (quantitySend > 0) {
            throw new Error(
              `${ERROR_LOGIC}: ticketProductId ${tpOrigin.id} không đủ số lượng lô hàng`
            )
          }
        })
      const ticketBatchCreatedList = await this.ticketBatchManager.insertManyAndReturnEntity(
        manager,
        ticketBatchInsertList
      )

      // 8. === UPDATE Batch ===
      const batchCalculatorMap: Record<string, { batchId: number; sumQuantitySend: number }> = {}
      for (let i = 0; i < ticketBatchCreatedList.length; i++) {
        const { batchId, quantity } = ticketBatchCreatedList[i]
        if (!batchCalculatorMap[batchId]) {
          batchCalculatorMap[batchId] = { batchId, sumQuantitySend: 0 }
        }
        batchCalculatorMap[batchId].sumQuantitySend += quantity
      }

      let batchModifiedList: Batch[] = []
      const batchCalculatorValues = Object.values(batchCalculatorMap)

      if (batchCalculatorValues.length) {
        const batchModifiedRaw: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" - temp."sumQuantitySend"
          FROM (VALUES `
          + batchCalculatorValues
            .map((calc) => `(${calc.batchId}, ${calc.sumQuantitySend})`)
            .join(', ')
          + `   ) AS temp("batchId", "sumQuantitySend")
          WHERE   "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )

        if (batchModifiedRaw[0].length != batchCalculatorValues.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchModifiedRaw[1]}`)
        }
        batchModifiedList = Batch.fromRaws(batchModifiedRaw[0])
      }

      // 9. === UPDATE TicketProduct: Tính lại costAmount ===
      const tpUpdateList = ticketProductOriginList.map((tpOrigin) => {
        let costAmount = 0
        if (tpOrigin.hasInventoryImpact) {
          const tb = ticketBatchCreatedList.filter((i) => i.ticketProductId === tpOrigin.id)
          costAmount = tb.reduce((acc, i) => acc + i.costPrice * i.quantity, 0)
        } else {
          costAmount = tpOrigin.quantity * productModifiedMap[tpOrigin.productId].costPrice
        }
        return {
          ticketProductId: tpOrigin.id,
          costAmount,
        }
      })

      const ticketProductModifiedRaw: [any[], number] = await manager.query(
        `
        UPDATE  "TicketProduct" "tp"
        SET     "costAmount"      = temp."costAmount",
                "deliveryStatus"  = ${DeliveryStatus.Delivered}
        FROM (VALUES `
        + tpUpdateList.map((u) => `(${u.ticketProductId}, ${u.costAmount})`).join(', ')
        + `   ) AS temp("ticketProductId", "costAmount")
        WHERE   "tp"."id"         = temp."ticketProductId" 
            AND "tp"."oid"        = ${oid}
        RETURNING "tp".*;        
        `
      )

      if (ticketProductModifiedRaw[0].length != tpUpdateList.length) {
        throw new Error(
          `${PREFIX}: Update TicketProduct, affected = ${ticketProductModifiedRaw[1]}`
        )
      }
      const ticketProductModifiedList = TicketProduct.fromRaws(ticketProductModifiedRaw[0])

      // 10. === CALCULATOR: số lượng ban đầu của product và batch ===
      productModifiedList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        // sumQuantitySend là số lượng trừ thật
        productCalculator.openQuantity = i.quantity + productCalculator.sumQuantitySend
      })

      // 11. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []
      ticketProductModifiedList.forEach((tp) => {
        const productCalculator = productCalculatorMap[tp.productId]
        // có trừ kho thì ghi nhiều bản ghi phụ thuộc vào số lượng ticketBatch
        if (tp.hasInventoryImpact) {
          const tbListFilter = ticketBatchCreatedList.filter((i) => i.ticketProductId === tp.id)
          if (!tbListFilter.length) {
            throw new Error(ERROR_LOGIC + 'tbListFilter.length = 0')
          }
          tbListFilter.forEach((tb) => {
            const productMovementInsert: ProductMovementInsertType = {
              oid,
              movementType: MovementType.Ticket,
              contactId: tp.customerId,
              voucherId: tp.ticketId,
              voucherProductId: tp.id,
              warehouseId: tp.warehouseId,
              productId: tp.productId,
              batchId: tb.batchId,
              isRefund: 0,
              openQuantity: productCalculator.openQuantity,
              quantity: -tb.quantity, // luôn lấy số lượng từ ticketBatch
              closeQuantity: productCalculator.openQuantity - tb.quantity,
              unitRate: tp.unitRate,
              costPrice: tb.costPrice,
              expectedPrice: tp.expectedPrice,
              actualPrice: tp.actualPrice,
              createdAt: time,
            }
            // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có nhiều ticketBatch
            // gán lại số lượng ban đầu vì productMovementInsert đã lấy
            productCalculator.openQuantity = productMovementInsert.closeQuantity
            productMovementInsertList.push(productMovementInsert)
          })
        }
        // không trừ kho thì không có batch, không trừ số lượng
        if (!tp.hasInventoryImpact) {
          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Ticket,
            contactId: tp.customerId,
            voucherId: tp.ticketId,
            voucherProductId: tp.id,
            warehouseId: tp.warehouseId,
            productId: tp.productId,
            batchId: 0,
            isRefund: 0,
            openQuantity: productCalculator.openQuantity,
            quantity: -tp.quantity, // luôn lấy số lượng trong đơn
            closeQuantity: productCalculator.openQuantity - 0, // lưu số lượng xuất thực tế
            unitRate: tp.unitRate,
            costPrice: productModifiedMap[tp.productId].costPrice,
            expectedPrice: tp.expectedPrice,
            actualPrice: tp.actualPrice,
            createdAt: time,
          }
          productCalculator.openQuantity = productMovementInsert.closeQuantity
          productMovementInsertList.push(productMovementInsert)
        }
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      // 13. === Update costAmount for ticket ===
      const costAmountOrigin = ticketProductOriginList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountModified = ticketProductModifiedList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)

      const costAmountAdd = costAmountModified - costAmountOrigin
      if (costAmountAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticket,
          itemMoney: {
            itemsCostAmountAdd: costAmountAdd,
          },
        })
      }

      return { ticket, productModifiedList, batchModifiedList, ticketBatchCreatedList }
    })
  }
}
