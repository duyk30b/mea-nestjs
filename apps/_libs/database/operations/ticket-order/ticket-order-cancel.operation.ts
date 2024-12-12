import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType, PaymentType } from '../../common/variable'
import { Batch, Customer, CustomerPayment, Product } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  CustomerPaymentManager,
  ProductMovementManager,
  TicketManager,
  TicketProductManager,
} from '../../managers'

@Injectable()
export class TicketOrderCancelOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private productMovementManager: ProductMovementManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async cancel(params: { oid: number; ticketId: number; time: number; description: string }) {
    const { oid, ticketId, time, description } = params
    const PREFIX = `ticketId=${ticketId} pay debt failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: {
            IN: [
              // TicketStatus.Draft, // thằng Draft thì xóa chứ không cancel
              TicketStatus.Approved,
              TicketStatus.Executing,
              TicketStatus.Debt,
              TicketStatus.Completed,
            ],
          },
        },
        { updatedAt: Date.now() }
      )

      const { customerId } = ticketOrigin
      let customer: Customer
      let customerPayment: CustomerPayment

      // nếu đã thanh toán thì trả thanh toán
      if (ticketOrigin.paid !== 0 || ticketOrigin.debt !== 0) {
        // === 2. UPDATE CUSTOMER ===
        if ([TicketStatus.Debt].includes(ticketOrigin.ticketStatus)) {
          customer = await this.customerManager.updateOneAndReturnEntity(
            manager,
            { oid, id: customerId },
            { debt: () => `debt - ${ticketOrigin.debt}` }
          )
        } else {
          customer = await this.customerManager.findOneBy(manager, { oid, id: customerId })
        }

        // chỉ bỏ nợ trong trường hợp TicketStatus.Debt, các trường hợp khác không hề ghi nợ
        const debt = ticketOrigin.ticketStatus === TicketStatus.Debt ? ticketOrigin.debt : 0
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -ticketOrigin.paid,
          debit: -debt, //
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: '',
          description,
        }
        const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
          manager,
          customerPaymentInsert
        )
      }

      const ticketProductList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        deliveryStatus: DeliveryStatus.Delivered,
      })
      // nếu đã gửi hàng thì trả gửi hàng
      if (ticketProductList.length) {
        const ticketProductMap = arrayToKeyValue(ticketProductList, 'id')

        // 4. === CALCULATOR: số lượng RETURN của product và batch ===
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
            openQuantity: number
            quantityGroupSend: number
          }
        > = {}
        for (let i = 0; i < ticketProductList.length; i++) {
          const { productId, batchId, quantity: quantityReturn } = ticketProductList[i]

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
            SET "quantity"  = CASE 
                                  WHEN (product."hasManageQuantity" = 0) THEN "product"."quantity" 
                                  ELSE "product"."quantity" + temp."quantityGroupSend"
                              END
            FROM (VALUES `
            + productCalculatorEntries
              .map(([productId, sl]) => `(${productId}, ${sl.quantityGroupSend})`)
              .join(', ')
            + `   ) AS temp("productId", "quantityGroupSend")
            WHERE   "product"."oid" = ${oid} 
                AND "product"."id" = temp."productId" 
            RETURNING "product".*;   
            `
          )
          if (productUpdateResult[1] != productCalculatorEntries.length) {
            throw new Error(
              `${PREFIX}: Update Product failed, ${JSON.stringify(productUpdateResult)}`
            )
          }
          productList = Product.fromRaws(productUpdateResult[0])
        }

        // 6. === UPDATE for BATCH ===
        let batchList: Batch[] = []
        const batchCalculatorEntries = Object.entries(batchCalculatorMap)

        if (batchCalculatorEntries.length) {
          const batchUpdateResult: [any[], number] = await manager.query(
            `
          UPDATE "Batch" "batch"
          SET "quantity" = "batch"."quantity" + temp."quantityGroupSend"
          FROM (VALUES `
            + batchCalculatorEntries
              .map(([batchId, sl]) => `(${batchId}, ${sl.quantityGroupSend})`)
              .join(', ')
            + `   ) AS temp("batchId", "quantityGroupSend")
          WHERE   "batch"."oid" = ${oid}
              AND "batch"."id" = temp."batchId" 
          RETURNING "batch".*;        
          `
          )
          if (batchUpdateResult[1] != batchCalculatorEntries.length) {
            throw new Error(`${PREFIX}: Update Batch failed, ${JSON.stringify(batchUpdateResult)}`)
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

        // 9. === CREATE: PRODUCT_MOVEMENT ===
        const productMovementInsertList = ticketProductList.map((ticketProduct) => {
          const productCalculator = productCalculatorMap[ticketProduct.productId]
          if (!productCalculator) {
            throw new Error(`${PREFIX}: Not found movement with ${ticketProduct.productId}`)
          }

          // không lấy quantity theo productCalculator được vì nó đã bị group nhiều record theo productId
          // không lấy quantity theo ticketProduct được (vì nó có thể trả 1 nửa hay gì gì đó)
          // phải lấy quantity theo ticketProduct (à lấy được, vì đây trả hết)
          const quantityReturn = productCalculator.allowChangeQuantity ? ticketProduct.quantity : 0

          const productMovementInsert: ProductMovementInsertType = {
            oid,
            warehouseId: ticketProduct.warehouseId,
            productId: ticketProduct.productId,
            voucherId: ticketId,
            contactId: customerId,
            movementType: MovementType.Ticket,
            isRefund: 1,
            createdAt: time,
            unitRate: ticketProduct.unitRate,
            costPrice: ticketProduct.costPrice,
            actualPrice: ticketProduct.actualPrice,
            expectedPrice: ticketProduct.expectedPrice,
            openQuantity: productCalculator.openQuantity,
            quantity: ticketProduct.quantity, // luôn lấy số lượng trong đơn
            closeQuantity: productCalculator.openQuantity + quantityReturn, // cộng trừ theo số lượng thực tế
          }

          // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì productMovementInsert đã lấy

          return productMovementInsert
        })
        if (productMovementInsertList.length) {
          await this.productMovementManager.insertMany(manager, productMovementInsertList)
        }

        // 10. === CREATE: BATCH_MOVEMENT ===
        const batchMovementInsertList = ticketProductList
          .filter((i) => i.batchId !== 0)
          .map((ticketProduct) => {
            const batchCalculator = batchCalculatorMap[ticketProduct.batchId]
            if (!batchCalculator) {
              throw new Error(`${PREFIX}: ` + `Not found movement with ${ticketProduct.productId}`)
            }

            const batchMovementInsert: BatchMovementInsertType = {
              oid,
              warehouseId: ticketProduct.warehouseId,
              productId: ticketProduct.productId,
              batchId: ticketProduct.batchId,
              voucherId: ticketId,
              contactId: customerId,
              movementType: MovementType.Ticket,
              isRefund: 1,
              createdAt: time,
              unitRate: ticketProduct.unitRate,
              actualPrice: ticketProduct.actualPrice,
              expectedPrice: ticketProduct.expectedPrice,
              openQuantity: batchCalculator.openQuantity,
              quantity: ticketProduct.quantity, // không lấy theo batchCalculator được vì nó đã bị group nhiều record theo productId
              closeQuantity: batchCalculator.openQuantity + ticketProduct.quantity,
            }
            // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            batchCalculator.openQuantity = batchMovementInsert.closeQuantity // gán lại số lượng ban đầu vì batchMovementInsert đã lấy

            return batchMovementInsert
          })
        if (batchMovementInsertList.length) {
          await manager.insert(BatchMovement, batchMovementInsertList)
        }
      }

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { ticketStatus: TicketStatus.Cancelled, paid: 0, debt: 0 }
      )

      return { ticket, customerPayment }
    })
  }
}
