import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, InsertResult, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../../common/helpers/object.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, DiscountType, PaymentType } from '../../../common/variable'
import {
  Batch,
  BatchMovement,
  Customer,
  Product,
  ProductMovement,
  Ticket,
  TicketProduct,
} from '../../../entities'
import { BatchMovementInsertType } from '../../../entities/batch-movement.entity'
import CustomerPayment, {
  CustomerPaymentInsertType,
} from '../../../entities/customer-payment.entity'
import { ProductMovementInsertType } from '../../../entities/product-movement.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

// còn bug với sản phẩm 0 đồng thì DeliveryStatus không thể tính theo productsMoney được
@Injectable()
export class TicketOrderReturnProductList {
  constructor(private dataSource: DataSource) { }

  async returnProductList(params: {
    oid: number
    ticketId: number
    time: number
    returnList: {
      ticketProductId: number
      actualPrice: number
      quantityReturn: number
      costAmountReturn: number
    }[]
    discountMoneyReturn: number
    surchargeReturn: number
    debtReturn: number
    paidReturn: number
    description: string
  }) {
    const {
      oid,
      ticketId,
      time,
      returnList,
      description,
      discountMoneyReturn,
      surchargeReturn,
      debtReturn,
      paidReturn,
    } = params
    const PREFIX = `TicketId = ${ticketId}, Return TicketProduct failed`

    const productsMoneyReturn = returnList.reduce((acc, item) => {
      return acc + item.quantityReturn * item.actualPrice
    }, 0)
    const totalCostAmountReturn = returnList.reduce((acc, item) => {
      return acc + item.costAmountReturn
    }, 0)

    if (!returnList.length) {
      throw new Error(`${PREFIX}: returnList.length = 0`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Executing, TicketStatus.Debt, TicketStatus.Completed]),
        deliveryStatus: In([DeliveryStatus.Delivered]),
        // totalMoney: MoreThanOrEqual(productsMoneyReturn - discountMoneyReturn),
      }
      const setTicketRoot: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        updatedAt: Date.now(),
      }
      const ticketRootUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketRoot)
        .returning('*')
        .execute()
      if (ticketRootUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketRoot = Ticket.fromRaw(ticketRootUpdateResult.raw[0])
      const { customerId, voucherType } = ticketRoot

      // === 2. INSERT CUSTOMER_PAYMENT  ===
      let customer: Customer = null
      let customerPayment: CustomerPayment = null
      if (
        (paidReturn > 0 || debtReturn > 0)
        && [TicketStatus.Debt, TicketStatus.Completed].includes(ticketRoot.ticketStatus)
      ) {
        if (debtReturn > 0) {
          const whereCustomer: FindOptionsWhere<Customer> = { oid, id: customerId }
          const customerUpdateResult: UpdateResult = await manager
            .createQueryBuilder()
            .update(Customer)
            .where(whereCustomer)
            .set({
              debt: () => `debt - ${debtReturn}`,
            })
            .returning('*')
            .execute()
          if (customerUpdateResult.affected !== 1) {
            throw new Error(`${PREFIX}: customerId=${customerId} update failed`)
          }
          customer = Customer.fromRaw(customerUpdateResult.raw[0])
        } else {
          customer = await manager.findOneBy(Customer, { oid, id: customerId })
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
        const customerPaymentInsertResult: InsertResult = await manager
          .createQueryBuilder()
          .insert()
          .into(CustomerPayment)
          .values(customerPaymentInsert)
          .returning('*')
          .execute()

        const customerPaymentList = CustomerPayment.fromRaws(customerPaymentInsertResult.raw)

        if (!customerPaymentList.length) {
          throw new Error(
            `${PREFIX}: Insert CustomerPayment failed: `
            + `${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
        customerPayment = customerPaymentList[0]
      }

      // === 3. UPDATE for TICKET_PRODUCT ===
      const ticketProductUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE "TicketProduct" tp
        SET "costAmount"      = tp."costAmount" - temp."costAmountReturn",
            "quantity"        = tp."quantity" - temp."quantityReturn",
            "quantityReturn"  = tp."quantityReturn" + temp."quantityReturn"
        FROM (VALUES `
        + returnList
          .map((i) => {
            return (
              `(${i.ticketProductId}, ${i.actualPrice},`
              + ` ${i.quantityReturn}, ${i.costAmountReturn})`
            )
          })
          .join(', ')
        + `   ) AS temp("ticketProductId", "actualPrice", 
                        "quantityReturn", "costAmountReturn"
                        )
        WHERE   tp."oid" = ${oid} 
            AND tp."ticketId" = ${ticketId}
            AND tp."id" = temp."ticketProductId" 
            AND tp."actualPrice" = temp."actualPrice"
            AND tp."deliveryStatus" = ${DeliveryStatus.Delivered}
        RETURNING tp.*;    
        `
      )
      if (ticketProductUpdateResult[0].length != returnList.length) {
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
      const productIdEntriesValue = Object.entries(productIdMapValue)
      if (productIdEntriesValue.length) {
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
          + productIdEntriesValue
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
        if (productUpdateResult[1] != productIdEntriesValue.length) {
          throw new Error(
            `${PREFIX}: Update Product failed, ${JSON.stringify(productUpdateResult)}`
          )
        }
        productList = Product.fromRaws(productUpdateResult[0])
      }

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
          throw new Error(`${PREFIX}: Update Batch failed, ${JSON.stringify(batchUpdateResult)}`)
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
        const currentReturn = returnList.find(
          (i) => i.ticketProductId === ticketProductActioned.id
        )
        // không lấy quantity theo currentMap được vì nó đã bị group nhiều record theo productId
        // không lấy quantity theo ticketProductActioned được, vì nó có thể trả 1 nửa hay gì gì đó 
        // phải lấy quantity theo currentReturn
        const quantityReturn = currentMap.hasManageQuantity ? currentReturn.quantityReturn : 0
        const costAmountReturn = currentMap.hasManageQuantity ? currentReturn.costAmountReturn : 0

        const draft: ProductMovementInsertType = {
          oid,
          productId: ticketProductActioned.productId,
          voucherId: ticketId,
          contactId: customerId,
          voucherType,
          isRefund: 1,
          createdAt: time,
          unitRate: ticketProductActioned.unitRate,
          actualPrice: ticketProductActioned.actualPrice,
          expectedPrice: ticketProductActioned.expectedPrice,
          openQuantity: currentMap.openQuantity,
          quantity: currentReturn.quantityReturn, // luôn lấy số lượng trong đơn
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

      // 9. === CREATE: BATCH_MOVEMENT ===
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
            contactId: customerId,
            voucherType,
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

      // === 10. UPDATE TICKET MONEY ===
      const ticketProductList = await manager.find(TicketProduct, { where: { oid, ticketId } })
      let deliveryStatus = DeliveryStatus.NoStock
      if (!ticketProductList.length) {
        deliveryStatus = DeliveryStatus.NoStock
      }
      else if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        deliveryStatus = DeliveryStatus.Pending
      }
      else if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
        deliveryStatus = DeliveryStatus.Delivered
      }
      else {
        throw new Error(`${PREFIX}: deliveryStatus for ticketProductList error:`
          + ` ${JSON.stringify(ticketProductList)}`)
      }

      const productsMoneyUpdate = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.actualPrice
      }, 0)
      if (productsMoneyUpdate != ticketRoot.productsMoney - productsMoneyReturn) {
        throw new Error(`${PREFIX}: productsMoneyUpdate = ${productsMoneyUpdate},`
          + ` productsMoneyReturn = ${productsMoneyReturn},`
          + ` rootProductsMoney = ${ticketRoot.productsMoney}`)
      }
      const totalCostAmountUpdate = ticketRoot.totalCostAmount - totalCostAmountReturn
      const discountMoneyUpdate = ticketRoot.discountMoney - discountMoneyReturn
      const surchargeUpdate = ticketRoot.surcharge - surchargeReturn
      const debtUpdate = ticketRoot.debt - debtReturn
      const paidUpdate = ticketRoot.paid - paidReturn

      const totalMoneyUpdate = ticketRoot.totalMoney
        - ticketRoot.productsMoney
        + productsMoneyUpdate
        + ticketRoot.discountMoney
        - discountMoneyUpdate
        - ticketRoot.surcharge
        + surchargeUpdate
      const profitUpdate = totalMoneyUpdate - totalCostAmountUpdate - ticketRoot.expense

      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        deliveryStatus,
        ticketStatus: () => `CASE 
            WHEN("ticketStatus" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing}
            WHEN(${debtUpdate} != 0) THEN ${TicketStatus.Debt}
            ELSE ${TicketStatus.Completed}
          END
        `,
        productsMoney: productsMoneyUpdate,
        totalCostAmount: totalCostAmountUpdate,
        discountType: DiscountType.VND, // đổi sang VND, vì thay đổi tiền thì % không còn đúng nữa
        discountMoney: discountMoneyUpdate,
        surcharge: surchargeUpdate,
        totalMoney: totalMoneyUpdate,
        discountPercent: () => `CASE
            WHEN (${totalMoneyUpdate} = 0) THEN 0
            ELSE ROUND(${discountMoneyUpdate} * 100.0 / ${totalMoneyUpdate}, 3)
          END`,
        debt: debtUpdate,
        paid: paidUpdate,
        profit: profitUpdate,
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
      const ticket = Ticket.fromRaw(ticketUpdateResult.raw[0])

      return {
        ticketBasic: ticket,
        productList,
        batchList,
        customer: customer || null,
        customerPayment: customerPayment || null,
      }
    })
  }
}
