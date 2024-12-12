import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { Batch, Product } from '../../entities'
import { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  BatchMovementManager,
  ProductMovementManager,
  TicketManager,
  TicketProductManager,
} from '../../managers'

@Injectable()
export class TicketSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private productMovementManager: ProductMovementManager,
    private batchMovementManager: BatchMovementManager
  ) { }

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
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Draft, TicketStatus.Approved, TicketStatus.Executing] },
        },
        { ticketStatus: TicketStatus.Executing }
      )

      // === 2. UPDATE TICKET_PRODUCT ===
      const ticketProductSendList = await this.ticketProductManager.updateAndReturnEntity(
        manager,
        {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
          quantity: { GT: 0 },
        },
        { deliveryStatus: DeliveryStatus.Delivered }
      )

      // 4. === CALCULATOR: số lượng lấy của product và batch ===
      // Có 2 trường hợp không làm thay đổi số lượng
      // --1. Sản phẩm có hasManageQuantity = 0
      // --2. Đơn hàng tạo tại thời điểm sản phẩm không quản lý số lượng => batchId = 0
      const productCalculatorMap: Record<
        string,
        {
          openQuantity: number
          quantityGroupSend: number
          allowChangeQuantity: boolean // đây là thời điểm tạo đơn có quản lý số lượng hay không, còn thời điểm xuất kho hay nhập kho vẫn có thể khác
        }
      > = {}
      const batchCalculatorMap: Record<
        string,
        {
          quantityGroupSend: number
          openQuantity: number
        }
      > = {}
      for (let i = 0; i < ticketProductSendList.length; i++) {
        const { productId, batchId, quantity } = ticketProductSendList[i]
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
          productCalculatorMap[productId].quantityGroupSend += quantity
          if (!batchCalculatorMap[batchId]) {
            batchCalculatorMap[batchId] = { quantityGroupSend: 0, openQuantity: 0 }
          }
          batchCalculatorMap[batchId].quantityGroupSend += quantity
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}
      const productCalculatorEntries = Object.entries(productCalculatorMap)
      if (productCalculatorEntries.length) {
        // nếu batchId = 0 hoặc "hasManageQuantity" = 0 đều không gây thay đổi số lượng
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity"    = CASE 
                                  WHEN (product."hasManageQuantity" = 0) THEN "product"."quantity" 
                                  ELSE "product"."quantity" - temp."quantityGroupSend"
                              END
          FROM (VALUES `
          + productCalculatorEntries
            .map(([productId, value]) => `(${productId}, ${value.quantityGroupSend})`)
            .join(', ')
          + `   ) AS temp("productId", "quantityGroupSend")
          WHERE   "product"."id" = temp."productId" 
              AND "product"."oid" = ${oid} 
          RETURNING "product".*;   
          `
        )
        if (productUpdateResult[1] != productCalculatorEntries.length) {
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
      const batchCalculatorEntries = Object.entries(batchCalculatorMap)

      if (batchCalculatorEntries.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" - temp."quantityGroupSend"
          FROM (VALUES `
          + batchCalculatorEntries
            .map(([batchId, value]) => `(${batchId}, ${value.quantityGroupSend})`)
            .join(', ')
          + `   ) AS temp("batchId", "quantityGroupSend")
          WHERE   "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )
        // Kết quả: "KHÔNG" cho phép số lượng âm
        if (batchUpdateResult[1] != batchCalculatorEntries.length) {
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
      }

      // 7. === CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const productCalculator = productCalculatorMap[i.id]
        if (!i.hasManageQuantity) {
          productCalculator.allowChangeQuantity = false //  product đã được cập nhật là không quản lý số lượng nữa
          productCalculator.quantityGroupSend = 0
        }
        productCalculator.openQuantity = i.quantity + productCalculator.quantityGroupSend
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity = i.quantity + batchCalculator.quantityGroupSend
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList = ticketProductSendList.map((ticketProductSend) => {
        const productCalculator = productCalculatorMap[ticketProductSend.productId]
        if (!productCalculator) {
          throw new Error(`${PREFIX}: Not found movement with ${ticketProductSend.productId}`)
        }
        const quantityCurrent = productCalculator.allowChangeQuantity
          ? ticketProductSend.quantity // không lấy theo productCalculator được vì nó đã group nhiều record theo productId
          : 0

        const productMovementInsert: ProductMovementInsertType = {
          oid,
          warehouseId: ticketProductSend.warehouseId,
          productId: ticketProductSend.productId,
          voucherId: ticketId,
          contactId: ticket.customerId,
          movementType: MovementType.Ticket,
          isRefund: 0,
          createdAt: time,
          unitRate: ticketProductSend.unitRate,
          costPrice: ticketProductSend.costPrice,
          actualPrice: ticketProductSend.actualPrice,
          expectedPrice: ticketProductSend.expectedPrice,
          openQuantity: productCalculator.openQuantity,
          quantity: -ticketProductSend.quantity, // luôn lấy số lượng trong đơn
          closeQuantity: productCalculator.openQuantity - quantityCurrent, // lưu số lượng xuất thực tế
        }

        // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì productMovementInsert đã lấy

        return productMovementInsert
      })
      if (productMovementInsertList.length) {
        await this.productMovementManager.insertMany(manager, productMovementInsertList)
      }

      // 9. === CREATE: BATCH_MOVEMENT ===
      const batchMovementInsertList = ticketProductSendList
        .filter((i) => i.batchId !== 0)
        .map((ticketProductSend) => {
          const batchCalculator = batchCalculatorMap[ticketProductSend.batchId]
          if (!batchCalculator) {
            throw new Error(
              `${PREFIX}: Not found ${ticketProductSend.batchId}` + ` when create batch movement`
            )
          }
          const quantityCurrent = ticketProductSend.quantity // không lấy theo batchCalculator được vì nó đã group nhiều record theo productId

          const batchMovementInsert: BatchMovementInsertType = {
            oid,
            warehouseId: ticketProductSend.warehouseId,
            productId: ticketProductSend.productId,
            batchId: ticketProductSend.batchId,
            voucherId: ticketId,
            contactId: ticket.customerId,
            movementType: MovementType.Ticket,
            isRefund: 0,
            createdAt: time,
            unitRate: ticketProductSend.unitRate,
            actualPrice: ticketProductSend.actualPrice,
            expectedPrice: ticketProductSend.expectedPrice,
            openQuantity: batchCalculator.openQuantity,
            quantity: -quantityCurrent,
            closeQuantity: batchCalculator.openQuantity - quantityCurrent,
          }
          // sau khi lấy rồi cần cập nhật openQuantity vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          batchCalculator.openQuantity = batchMovementInsert.closeQuantity // gán lại số lượng ban đầu vì batchMovementInsert đã lấy

          return batchMovementInsert
        })
      if (batchMovementInsertList.length) {
        await this.batchMovementManager.insertMany(manager, batchMovementInsertList)
      }

      return { ticket, productList, batchList }
    })
  }
}
