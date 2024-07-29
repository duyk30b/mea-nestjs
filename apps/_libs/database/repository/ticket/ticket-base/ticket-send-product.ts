import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, MoreThan, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../../common/helpers/object.helper'
import { DTimer } from '../../../../common/helpers/time.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, VoucherType } from '../../../common/variable'
import {
  Batch,
  BatchMovement,
  Product,
  ProductMovement,
  Ticket,
  TicketProduct,
} from '../../../entities'
import { BatchMovementInsertType } from '../../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../../entities/product-movement.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketSendProduct {
  constructor(private dataSource: DataSource) { }

  async sendProduct(params: {
    oid: number
    ticketId: number
    time: number
    allowNegativeQuantity: boolean
  }) {
    const { oid, ticketId, time, allowNegativeQuantity } = params
    const PREFIX = `TicketId = ${ticketId}, sendProductAndPayment failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE STATUS for TICKET ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Draft, TicketStatus.Approved, TicketStatus.Executing]),
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: TicketStatus.Executing,
      }
      const ticketUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected != 1) {
        throw new Error(
          `${PREFIX}: Update Ticket failed:`
          + ` ticketUpdateResult = ${JSON.stringify(ticketUpdateResult)}`
        )
      }
      const ticket = Ticket.fromRaw(ticketUpdateResult.raw[0])

      // === 2. UPDATE TICKET_PRODUCT ===
      const whereTicketProductSend: FindOptionsWhere<TicketProduct> = {
        oid,
        ticketId,
        deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
        quantity: MoreThan(0),
      }
      const setTicketProductSend: {
        [P in keyof NoExtra<Partial<TicketProduct>>]: TicketProduct[P] | (() => string)
      } = {
        deliveryStatus: DeliveryStatus.Delivered,
      }
      const ticketProductSendListUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(TicketProduct)
        .where(whereTicketProductSend)
        .set(setTicketProductSend)
        .returning('*')
        .execute()

      // không gắn vào ticket vì ticket còn nhiều ticketProductList khác đã delivered
      const ticketProductSendList = TicketProduct.fromRaws(ticketProductSendListUpdateResult.raw)

      // 4. === CALCULATOR: số lượng lấy của product và batch ===
      const productIdMapValue: Record<
        string,
        {
          quantitySend: number
          costAmountSend: number
          openQuantity: number
          openCostAmount: number
          hasManageQuantity: 0 | 1
        }
      > = {}
      const batchIdMapValue: Record<string, { quantitySend: number; openQuantity: number }> = {}
      for (let i = 0; i < ticketProductSendList.length; i++) {
        const { productId, batchId, quantity, costAmount } = ticketProductSendList[i]
        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantitySend: 0,
            costAmountSend: 0,
            openQuantity: 0,
            openCostAmount: 0,
            hasManageQuantity: 1,
          }
        }
        productIdMapValue[productId].quantitySend += quantity
        productIdMapValue[productId].costAmountSend += costAmount

        if (batchId != 0) {
          if (!batchIdMapValue[batchId]) {
            batchIdMapValue[batchId] = { quantitySend: 0, openQuantity: 0 }
          }
          batchIdMapValue[batchId].quantitySend += quantity
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}
      const productIdEntriesValue = Object.entries(productIdMapValue)
      if (productIdEntriesValue.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity"    = CASE 
                                  WHEN  (product."hasManageQuantity" = 0) THEN 0 
                                  ELSE "product"."quantity" - temp."quantitySend"
                              END,
              "costAmount"  = CASE 
                                  WHEN  (product."hasManageQuantity" = 0) THEN 0 
                                  ELSE "product"."costAmount" - temp."costAmountSend"
                              END
          FROM (VALUES `
          + productIdEntriesValue
            .map(([productId, value]) => {
              return `(${productId}, ${value.quantitySend}, ${value.costAmountSend})`
            })
            .join(', ')
          + `   ) AS temp("productId", "quantitySend", "costAmountSend")
          WHERE   "product"."id" = temp."productId" 
              AND "product"."oid" = ${oid} 
          RETURNING "product".*;   
          `
        )
        if (productUpdateResult[1] != productIdEntriesValue.length) {
          throw new Error(
            `${PREFIX}: Update Product failed, ${JSON.stringify(productUpdateResult)}`
          )
        }
        productList = Product.fromRaws(productUpdateResult[0])
        productMap = arrayToKeyValue(productList, 'id')
        if (!allowNegativeQuantity) {
          productList.forEach((i) => {
            if (i.quantity < 0) {
              throw new Error(`Sản phẩm ${i.brandName} không đủ số lượng tồn kho`)
            }
          })
        }
      }

      // 6. === UPDATE for BATCH ===
      let batchList: Batch[] = []
      const batchIdEntriesSelect = Object.entries(batchIdMapValue)

      if (batchIdEntriesSelect.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" - temp."quantitySend"
          FROM (VALUES `
          + batchIdEntriesSelect
            .map(([batchId, value]) => `(${batchId}, ${value.quantitySend})`)
            .join(', ')
          + `   ) AS temp("batchId", "quantitySend")
          WHERE   "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )
        // Kết quả: "KHÔNG" cho phép số lượng âm
        if (batchUpdateResult[1] != batchIdEntriesSelect.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
        if (!allowNegativeQuantity) {
          batchList.forEach((i) => {
            if (i.quantity < 0) {
              const product = productMap[i.productId]
              throw new Error(
                `Sản phẩm ${product.brandName},`
                + ` lô ${i.lotNumber} HSD ${DTimer.timeToText(i.expiryDate, 'DD/MM/YYYY')}`
                + ` không đủ số lượng tồn kho`
              )
            }
          })
        }

        // Nếu số lượng lô hàng bị quay về 0, thì cần phải tính lại HSD cho sản phẩm gốc
        const batchZeroQuantityList = batchList.filter((i) => i.quantity === 0)
        if (batchZeroQuantityList.length) {
          const productReCalculatorIds = batchZeroQuantityList.map((i) => i.productId)
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
            const productReCalculatorFind = productReCalculatorList.find((i) => i.id === productId)
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
          currentMap.quantitySend = 0
          currentMap.costAmountSend = 0
        } else {
          currentMap.openQuantity = i.quantity + currentMap.quantitySend
          currentMap.openCostAmount = i.costAmount + currentMap.costAmountSend
        }
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft = ticketProductSendList.map((ticketProductSend) => {
        const currentMap = productIdMapValue[ticketProductSend.productId]
        if (!currentMap) {
          throw new Error(`${PREFIX}: Not found movement with ${ticketProductSend.productId}`)
        }
        const quantitySend = currentMap.hasManageQuantity ? ticketProductSend.quantity : 0 // không lấy theo currentMap được vì nó đã group nhiều record theo productId
        const costAmountSend = currentMap.hasManageQuantity ? ticketProductSend.costAmount : 0

        const draft: ProductMovementInsertType = {
          oid,
          productId: ticketProductSend.productId,
          voucherId: ticketId,
          contactId: ticket.customerId,
          voucherType: VoucherType.Ticket,
          isRefund: 0,
          createdAt: time,
          unitRate: ticketProductSend.unitRate,
          actualPrice: ticketProductSend.actualPrice,
          expectedPrice: ticketProductSend.expectedPrice,
          openQuantity: currentMap.openQuantity,
          quantity: -ticketProductSend.quantity, // luôn lấy số lượng trong đơn
          closeQuantity: currentMap.openQuantity - quantitySend, // lưu số lượng xuất thực tế
          openCostAmount: currentMap.openCostAmount,
          costAmount: -ticketProductSend.costAmount,
          closeCostAmount: currentMap.openCostAmount - costAmountSend,
        }

        // sau khi lấy rồi cần cập nhật currentMap vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
        currentMap.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy

        return draft
      })
      if (productMovementListDraft.length) {
        await manager.insert(ProductMovement, productMovementListDraft)
      }

      // 9. === CREATE: BATCH_MOVEMENT ===
      const batchMovementListDraft = ticketProductSendList
        .filter((i) => i.batchId !== 0)
        .map((ticketProductSend) => {
          const currentMap = batchIdMapValue[ticketProductSend.batchId]
          if (!currentMap) {
            throw new Error(
              `${PREFIX}: Not found ${ticketProductSend.batchId}` + ` when create batch movement`
            )
          }
          const quantitySend = ticketProductSend.quantity // không lấy theo currentMap được vì nó đã group nhiều record theo productId

          const draft: BatchMovementInsertType = {
            oid,
            productId: ticketProductSend.productId,
            batchId: ticketProductSend.batchId,
            voucherId: ticketId,
            contactId: ticket.customerId,
            voucherType: VoucherType.Ticket,
            isRefund: 0,
            createdAt: time,
            unitRate: ticketProductSend.unitRate,
            actualPrice: ticketProductSend.actualPrice,
            expectedPrice: ticketProductSend.expectedPrice,
            openQuantity: currentMap.openQuantity,
            quantity: -quantitySend,
            closeQuantity: currentMap.openQuantity - quantitySend,
          }
          // sau khi lấy rồi cần cập nhật openQuantity vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy

          return draft
        })
      if (batchMovementListDraft.length) {
        await manager.insert(BatchMovement, batchMovementListDraft)
      }

      return { ticketBasic: ticket, productList, batchList }
    })
  }
}
