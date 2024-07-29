import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, InsertResult, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../../common/helpers/object.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, PaymentType, VoucherType } from '../../../common/variable'
import {
  Batch,
  Customer,
  CustomerPayment,
  Product,
  ProductMovement,
  Ticket,
  TicketProduct,
} from '../../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../../entities/batch-movement.entity'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import { ProductMovementInsertType } from '../../../entities/product-movement.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketOrderCancel {
  constructor(private dataSource: DataSource) {}

  async cancel(params: { oid: number; ticketId: number; time: number; description: string }) {
    const { oid, ticketId, time, description } = params
    const PREFIX = `ticketId=${ticketId} pay debt failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([
          // TicketStatus.Draft, // thằng Draft thì xóa chứ không cancel
          TicketStatus.Approved,
          TicketStatus.Executing,
          TicketStatus.Debt,
          TicketStatus.Completed,
        ]),
      }
      const setTicketRoot: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        updatedAt: Date.now(),
      }
      const ticketUpdateRootResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketRoot)
        .returning('*')
        .execute()
      if (ticketUpdateRootResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketRoot = Ticket.fromRaw(ticketUpdateRootResult.raw[0])
      const { customerId } = ticketRoot

      let customer: Customer
      let customerPayment: CustomerPayment

      // nếu đã thanh toán thì trả thanh toán
      if (ticketRoot.paid !== 0 || ticketRoot.debt !== 0) {
        // === 2. UPDATE CUSTOMER ===
        if ([TicketStatus.Debt].includes(ticketRoot.ticketStatus)) {
          const whereCustomer: FindOptionsWhere<Customer> = { oid, id: customerId }
          const customerUpdateResult: UpdateResult = await manager
            .createQueryBuilder()
            .update(Customer)
            .where(whereCustomer)
            .set({
              debt: () => `debt - ${ticketRoot.debt}`,
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

        // chỉ bỏ nợ trong trường hợp TicketStatus.Debt, các trường hợp khác không hề ghi nợ
        const debt = ticketRoot.ticketStatus === TicketStatus.Debt ? ticketRoot.debt : 0
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -ticketRoot.paid,
          debit: -debt, //
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
        customerPayment = customerPaymentList[0]

        if (!customerPayment) {
          throw new Error(
            `${PREFIX}: Insert CustomerPayment failed:`
              + ` ${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
      }

      const ticketProductList = await manager.find(TicketProduct, {
        where: {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        },
      })
      // nếu đã gửi hàng thì trả gửi hàng
      if (ticketProductList.length) {
        const ticketProductMap = arrayToKeyValue(ticketProductList, 'id')

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
        for (let i = 0; i < ticketProductList.length; i++) {
          const quantityReturn = ticketProductList[i].quantity
          const costAmountReturn = ticketProductList[i].costAmount
          const ticketProductId = ticketProductList[i].id
          const { productId, batchId } = ticketProductMap[ticketProductId]

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

        // 9. === CREATE: PRODUCT_MOVEMENT ===
        const productMovementListDraft = ticketProductList.map((ticketProduct) => {
          const currentMap = productIdMapValue[ticketProduct.productId]
          if (!currentMap) {
            throw new Error(`${PREFIX}: Not found movement with ${ticketProduct.productId}`)
          }

          // không lấy quantity theo currentMap được vì nó đã bị group nhiều record theo productId
          // không lấy quantity theo ticketProduct được, vì nó có thể trả 1 nửa hay gì gì đó
          // phải lấy quantity theo ticketProduct
          const quantityReturn = currentMap.hasManageQuantity ? ticketProduct.quantity : 0
          const costAmountReturn = currentMap.hasManageQuantity ? ticketProduct.costAmount : 0

          const draft: ProductMovementInsertType = {
            oid,
            productId: ticketProduct.productId,
            voucherId: ticketId,
            contactId: customerId,
            voucherType: VoucherType.Ticket,
            isRefund: 1,
            createdAt: time,
            unitRate: ticketProduct.unitRate,
            actualPrice: ticketProduct.actualPrice,
            expectedPrice: ticketProduct.expectedPrice,
            openQuantity: currentMap.openQuantity,
            quantity: ticketProduct.quantity, // luôn lấy số lượng trong đơn
            closeQuantity: currentMap.openQuantity + quantityReturn, // cộng trừ theo số lượng thực tế
            openCostAmount: currentMap.openCostAmount,
            costAmount: costAmountReturn,
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
        const batchMovementsDraft = ticketProductList
          .filter((i) => i.batchId !== 0)
          .map((ticketProduct) => {
            const currentMap = batchIdMapValue[ticketProduct.batchId]
            if (!currentMap) {
              throw new Error(`${PREFIX}: ` + `Not found movement with ${ticketProduct.productId}`)
            }

            const draft: BatchMovementInsertType = {
              oid,
              productId: ticketProduct.productId,
              batchId: ticketProduct.batchId,
              voucherId: ticketId,
              contactId: customerId,
              voucherType: VoucherType.Ticket,
              isRefund: 1,
              createdAt: time,
              unitRate: ticketProduct.unitRate,
              actualPrice: ticketProduct.actualPrice,
              expectedPrice: ticketProduct.expectedPrice,
              openQuantity: currentMap.openQuantity,
              quantity: ticketProduct.quantity, // không lấy theo currentMap được vì nó đã bị group nhiều record theo productId
              closeQuantity: currentMap.openQuantity + ticketProduct.quantity,
            }
            // sau khi lấy rồi cần cập nhật before vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            currentMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy

            return draft
          })
        if (batchMovementsDraft.length) {
          await manager.insert(BatchMovement, batchMovementsDraft)
        }
      }

      // === 2. TICKET: update ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ticketStatus: TicketStatus.Cancelled,
        paid: 0,
        debt: 0,
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
      if (customer) ticket.customer = customer

      return { ticketBasic: ticket, customerPayment }
    })
  }
}
