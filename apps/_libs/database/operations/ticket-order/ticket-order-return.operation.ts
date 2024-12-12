import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DeliveryStatus, MovementType, PaymentType } from '../../common/variable'
import { Batch, BatchMovement, Customer, Product, TicketProduct } from '../../entities'
import { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import CustomerPayment, { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  CustomerPaymentManager,
  ProductMovementManager,
  TicketManager,
} from '../../managers'

// còn bug với sản phẩm 0 đồng thì DeliveryStatus không thể tính theo productMoney được
@Injectable()
export class TicketOrderReturnOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private productMovementManager: ProductMovementManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async return(params: {
    oid: number
    ticketId: number
    time: number
    description: string
    ticketProductReturnList: {
      ticketProductId: number
      quantityReturn: number
    }[]
    ticketProcedureReturnList: {
      ticketProcedureId: number
      quantityReturn: number
    }[]
    totalCostAmountUpdate: number
    productMoneyUpdate: number
    procedureMoneyUpdate: number
    itemsActualMoneyUpdate: number
    itemsDiscountUpdate: number

    discountMoneyUpdate: number
    discountPercentUpdate: number
    surchargeUpdate: number
    expenseUpdate: number

    totalMoneyUpdate: number
    profitUpdate: number
    paidUpdate: number
    debtUpdate: number
  }) {
    const {
      oid,
      ticketId,
      time,
      description,

      ticketProductReturnList,
      ticketProcedureReturnList,

      totalCostAmountUpdate,
      productMoneyUpdate,
      procedureMoneyUpdate,
      itemsActualMoneyUpdate,
      itemsDiscountUpdate,

      discountMoneyUpdate,
      discountPercentUpdate,
      surchargeUpdate,
      expenseUpdate,

      totalMoneyUpdate,
      profitUpdate,
      paidUpdate,
      debtUpdate,
    } = params
    const PREFIX = `TicketId = ${ticketId}, Return TicketProduct failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Debt, TicketStatus.Completed] },
        },
        { updatedAt: Date.now() }
      )

      const { customerId } = ticketOrigin
      const debtReturn = ticketOrigin.debt - debtUpdate
      const paidReturn = ticketOrigin.paid - paidUpdate

      // === 2. INSERT CUSTOMER_PAYMENT  ===
      let customer: Customer = null
      const customerPayment: CustomerPayment = null
      if (debtReturn !== 0 || paidReturn !== 0) {
        if (debtReturn !== 0) {
          customer = await this.customerManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketOrigin.customerId },
            { debt: () => `debt - ${debtReturn}` }
          )
        } else {
          customer = await this.customerManager.findOneBy(manager, { oid, id: customerId })
        }
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + debtReturn

        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -paidReturn,
          debit: -debtReturn,
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

      // === 3. UPDATE for TICKET_PROCEDURE ===
      if (ticketProcedureReturnList.length) {
        const ticketProcedureUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "TicketProcedure" tp
          SET "quantity"        = tp."quantity" - temp."quantityReturn"
          FROM (VALUES `
          + ticketProcedureReturnList
            .map((i) => `(${i.ticketProcedureId}, ${i.quantityReturn})`)
            .join(', ')
          + `   ) AS temp("ticketProcedureId", "quantityReturn")
          WHERE   tp."oid" = ${oid} 
              AND tp."ticketId" = ${ticketId}
              AND tp."id" = temp."ticketProcedureId" 
          RETURNING tp.*;    
          `
        )
        if (ticketProcedureUpdateResult[0].length != ticketProcedureReturnList.length) {
          throw new Error(
            `${PREFIX}: Update TicketProcedure, affected = ${ticketProcedureUpdateResult[1]}`
          )
        }
      }

      // === 4. UPDATE for TICKET_PRODUCT ===
      let productList: Product[] = []
      let batchList: Batch[] = []
      if (ticketProductReturnList.length) {
        const ticketProductUpdateResult: [any[], number] = await manager.query(
          `
        UPDATE "TicketProduct" tp
        SET "quantity"        = tp."quantity" - temp."quantityReturn",
            "deliveryStatus"  = CASE 
                                    WHEN  (tp."quantity" = temp."quantityReturn") 
                                      THEN ${DeliveryStatus.NoStock} 
                                    ELSE ${DeliveryStatus.Delivered} 
                                END
        FROM (VALUES `
          + ticketProductReturnList
            .map((i) => `(${i.ticketProductId}, ${i.quantityReturn})`)
            .join(', ')
          + `   ) AS temp("ticketProductId", "quantityReturn")
        WHERE   tp."oid" = ${oid} 
            AND tp."ticketId" = ${ticketId}
            AND tp."id" = temp."ticketProductId" 
            AND tp."deliveryStatus" = ${DeliveryStatus.Delivered}
        RETURNING tp.*;    
        `
        )
        if (ticketProductUpdateResult[0].length != ticketProductReturnList.length) {
          throw new Error(
            `${PREFIX}: Update TicketProduct, affected = ${ticketProductUpdateResult[1]}`
          )
        }

        // ticketProductActionedList: chỉ những record bị ảnh hưởng, còn nhiều record khác nữa
        const ticketProductActionedList = TicketProduct.fromRaws(ticketProductUpdateResult[0])
        const ticketProductActionedMap = arrayToKeyValue(ticketProductActionedList, 'id')
        ticketProductActionedList.forEach((i) => {
          if (i.quantity < 0) {
            throw new Error(`Số lượng trả vượt quá số lượng mua hàng`)
          }
        })

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
            quantityGroupSend: number
            openQuantity: number
          }
        > = {}
        for (let i = 0; i < ticketProductReturnList.length; i++) {
          const { quantityReturn, ticketProductId } = ticketProductReturnList[i]
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
          const currentMap = batchCalculatorMap[i.id]
          currentMap.openQuantity = i.quantity - currentMap.quantityGroupSend
        })

        // 8. === CREATE: PRODUCT_MOVEMENT ===
        const productMovementInsertList = ticketProductActionedList.map((ticketProductActioned) => {
          const productCalculator = productCalculatorMap[ticketProductActioned.productId]
          if (!productCalculator) {
            throw new Error(`${PREFIX}: Not found movement with ${ticketProductActioned.productId}`)
          }
          const currentReturn = ticketProductReturnList.find((i) => {
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
            contactId: customerId,
            movementType: MovementType.Ticket,
            isRefund: 1,
            createdAt: time,
            unitRate: ticketProductActioned.unitRate,
            costPrice: ticketProductActioned.costPrice,
            actualPrice: ticketProductActioned.actualPrice,
            expectedPrice: ticketProductActioned.expectedPrice,
            openQuantity: productCalculator.openQuantity,
            quantity: currentReturn.quantityReturn, // luôn lấy số lượng trong đơn
            closeQuantity: productCalculator.openQuantity + quantityReturn, // cộng hoặc trừ theo số lượng thực tế
          }

          // sau khi lấy rồi cần cập nhật productCalculator vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
          productCalculator.openQuantity = productMovementInsert.closeQuantity // gán lại số lượng ban đầu vì productMovementInsert đã lấy

          return productMovementInsert
        })
        if (productMovementInsertList.length) {
          await this.productMovementManager.insertMany(manager, productMovementInsertList)
        }

        // 9. === CREATE: BATCH_MOVEMENT ===
        const batchMovementsDraft = ticketProductActionedList
          .filter((i) => i.batchId !== 0)
          .map((ticketProductActioned) => {
            const batchCalculator = batchCalculatorMap[ticketProductActioned.batchId]
            if (!batchCalculator) {
              throw new Error(
                `${PREFIX}: Not found movement with ${ticketProductActioned.productId}`
              )
            }
            const currentReturn = ticketProductReturnList.find((i) => {
              return i.ticketProductId === ticketProductActioned.id
            })
            // không lấy theo batchCalculator được vì nó đã bị group nhiều record theo productId
            const quantityReturn = currentReturn.quantityReturn

            const batchMovementInsert: BatchMovementInsertType = {
              oid,
              warehouseId: ticketProductActioned.warehouseId,
              productId: ticketProductActioned.productId,
              batchId: ticketProductActioned.batchId,
              voucherId: ticketId,
              contactId: customerId,
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
        if (batchMovementsDraft.length) {
          await manager.insert(BatchMovement, batchMovementsDraft)
        }
      }

      // === 10. UPDATE TICKET MONEY ===
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Debt, TicketStatus.Completed] },
        },
        {
          ticketStatus: () => `CASE 
              WHEN("ticketStatus" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing}
              WHEN(${debtUpdate} != 0) THEN ${TicketStatus.Debt}
              ELSE ${TicketStatus.Completed}
            END
          `,

          totalCostAmount: totalCostAmountUpdate,
          productMoney: productMoneyUpdate,
          procedureMoney: procedureMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          itemsDiscount: itemsDiscountUpdate,

          discountMoney: discountMoneyUpdate,
          discountPercent: discountPercentUpdate,
          surcharge: surchargeUpdate,
          expense: expenseUpdate,

          totalMoney: totalMoneyUpdate,
          profit: profitUpdate,
          paid: paidUpdate,
          debt: debtUpdate,
        }
      )

      return {
        ticket,
        productList,
        batchList,
        customer: customer || null,
        customerPayment: customerPayment || null,
      }
    })
  }
}
