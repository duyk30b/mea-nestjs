import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  InsertResult,
  UpdateResult,
} from 'typeorm'
import { arrayToKeyValue } from '../../../../common/helpers/object.helper'
import { DTimer } from '../../../../common/helpers/time.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, PaymentType, VoucherType } from '../../../common/variable'
import {
  Batch,
  Customer,
  CustomerPayment,
  Product,
  Ticket,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
} from '../../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../../entities/batch-movement.entity'
import { CustomerPaymentInsertType } from '../../../entities/customer-payment.entity'
import ProductMovement, {
  ProductMovementInsertType,
} from '../../../entities/product-movement.entity'
import { TicketExpenseInsertType } from '../../../entities/ticket-expense.entity'
import { TicketProcedureInsertType, TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../../entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../../entities/ticket-surcharge.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketOrderDebtSuccessUpdateType,
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

@Injectable()
export class TicketOrderDebtSuccessUpdate {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async update<T extends TicketOrderDebtSuccessUpdateType>(params: {
    oid: number
    ticketId: number
    ticketOrderDebtSuccessUpdate: NoExtra<TicketOrderDebtSuccessUpdateType, T>
    ticketOrderProductDraftList: TicketOrderProductDraftType[]
    ticketOrderProcedureDraftList: TicketOrderProcedureDraftType[]
    ticketOrderSurchargeDraftList: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftList: TicketOrderExpenseDraftType[]
    description: string
    allowNegativeQuantity: boolean
  }) {
    const {
      oid,
      ticketId,
      ticketOrderDebtSuccessUpdate,
      ticketOrderProductDraftList,
      ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList,
      description,
      allowNegativeQuantity,
    } = params
    const time = ticketOrderDebtSuccessUpdate.registeredAt
    const PREFIX = `TicketId = ${ticketId}, Update failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: In([TicketStatus.Debt, TicketStatus.Completed]),
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
      const { customerId } = ticketRoot

      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ...ticketOrderDebtSuccessUpdate,
        ticketStatus:
          ticketOrderDebtSuccessUpdate.paid === ticketOrderDebtSuccessUpdate.totalMoney
            ? TicketStatus.Completed
            : TicketStatus.Debt,
        paid: ticketOrderDebtSuccessUpdate.paid,
        debt: ticketOrderDebtSuccessUpdate.totalMoney - ticketOrderDebtSuccessUpdate.paid,
        endedAt: ticketOrderDebtSuccessUpdate.registeredAt,
        year: DTimer.info(time, 7).year,
        month: DTimer.info(time, 7).month + 1,
        date: DTimer.info(time, 7).date,
      }
      const ticketUpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected !== 1) {
        throw new Error(`Update Ticket ${ticketId} failed: Status invalid`)
      }
      const ticketBasic = Ticket.fromRaw(ticketUpdateResult.raw[0])

      // === 2. INSERT CUSTOMER_PAYMENT  ===
      let customer: Customer = null
      let customerPayment: CustomerPayment = null
      if (ticketBasic.debt != ticketRoot.debt || ticketBasic.paid != ticketRoot.paid) {
        const debtChange = ticketBasic.debt - ticketRoot.debt
        const paidChange = ticketBasic.paid - ticketRoot.paid
        if (debtChange != 0) {
          const whereCustomer: FindOptionsWhere<Customer> = { oid, id: customerId }
          const customerUpdateResult: UpdateResult = await manager
            .createQueryBuilder()
            .update(Customer)
            .where(whereCustomer)
            .set({
              debt: () => `debt + ${debtChange}`,
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
        const customerOpenDebt = customerCloseDebt - debtChange

        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId,
          ticketId,
          createdAt: time,
          paymentType: PaymentType.Close,
          paid: paidChange,
          debit: debtChange,
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

      // === 3. DELETE OLD_RECORD, INSERT_NEW_RECORD
      const ticketProductReturnList = await manager.find(TicketProduct, {
        where: {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        },
      })

      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      await manager.delete(TicketRadiology, { oid, ticketId })
      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })

      let ticketProductSendList: TicketProduct[] = []
      if (ticketOrderProductDraftList.length) {
        const ticketProductListInsert = ticketOrderProductDraftList.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            oid,
            ticketId,
            customerId,
            quantityPrescription: i.quantity, // cho lấy số lượng kê đơn bằng số lượng bán
            quantityReturn: 0,
            deliveryStatus: DeliveryStatus.Delivered, // cho xử lý xong luôn
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        const ticketProductSendListInsertResult: InsertResult = await manager
          .createQueryBuilder()
          .insert()
          .into(TicketProduct)
          .values(ticketProductListInsert)
          .returning('*')
          .execute()
        ticketProductSendList = TicketProduct.fromRaws(ticketProductSendListInsertResult.raw)
      }

      if (ticketOrderProcedureDraftList.length) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftList.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            oid,
            ticketId,
            customerId,
            startedAt: ticketOrderDebtSuccessUpdate.registeredAt,
            status: TicketProcedureStatus.Completed,
            imageIds: JSON.stringify([]),
            result: '',
          }
          return ticketProcedure
        })
        await manager.insert(TicketProcedure, ticketProcedureListInsert)
      }

      if (ticketOrderSurchargeDraftList.length) {
        const ticketSurchargeListInsert = ticketOrderSurchargeDraftList.map((i) => {
          const ticketSurcharge: TicketSurchargeInsertType = {
            ...i,
            oid,
            ticketId,
          }
          return ticketSurcharge
        })
        await manager.insert(TicketSurcharge, ticketSurchargeListInsert)
      }

      if (ticketOrderExpenseDraftList.length) {
        const ticketExpenseListInsert = ticketOrderExpenseDraftList.map((i) => {
          const ticketExpense: TicketExpenseInsertType = {
            ...i,
            oid,
            ticketId,
          }
          return ticketExpense
        })
        await manager.insert(TicketExpense, ticketExpenseListInsert)
      }

      // 4. === CALCULATOR: số lượng RETURN của product và batch ===
      const productIdMapValue: Record<
        string,
        {
          quantityReturn: number
          costAmountReturn: number
          actualAmountReturn: number
          quantitySend: number
          costAmountSend: number
          actualAmountSend: number
          openQuantity: number
          openCostAmount: number
          hasManageQuantity: 0 | 1
        }
      > = {}
      const batchIdMapValue: Record<
        string,
        {
          quantityReturn: number
          quantitySend: number
          openQuantity: number
          actualAmountReturn: number
          actualAmountSend: number
        }
      > = {}
      for (let i = 0; i < ticketProductReturnList.length; i++) {
        const itemReturn = ticketProductReturnList[i]
        const { productId, batchId } = itemReturn

        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantityReturn: 0,
            costAmountReturn: 0,
            actualAmountReturn: 0,
            quantitySend: 0,
            costAmountSend: 0,
            actualAmountSend: 0,
            openQuantity: 0,
            openCostAmount: 0,
            hasManageQuantity: 1,
          }
        }
        productIdMapValue[productId].quantityReturn += itemReturn.quantity
        productIdMapValue[productId].costAmountReturn += itemReturn.costAmount
        productIdMapValue[productId].actualAmountReturn
          += itemReturn.quantity * itemReturn.actualPrice

        if (batchId != 0) {
          if (!batchIdMapValue[batchId]) {
            batchIdMapValue[batchId] = {
              quantityReturn: 0,
              quantitySend: 0,
              openQuantity: 0,
              actualAmountReturn: 0,
              actualAmountSend: 0,
            }
          }
          batchIdMapValue[batchId].quantityReturn += itemReturn.quantity
          batchIdMapValue[batchId].actualAmountReturn
            += itemReturn.quantity * itemReturn.actualPrice
        }
      }

      for (let i = 0; i < ticketProductSendList.length; i++) {
        const itemSend = ticketProductSendList[i]
        const { productId, batchId } = itemSend

        if (!productIdMapValue[productId]) {
          productIdMapValue[productId] = {
            quantityReturn: 0,
            costAmountReturn: 0,
            actualAmountReturn: 0,
            quantitySend: 0,
            costAmountSend: 0,
            actualAmountSend: 0,
            openQuantity: 0,
            openCostAmount: 0,
            hasManageQuantity: 1,
          }
        }
        productIdMapValue[productId].quantitySend += itemSend.quantity
        productIdMapValue[productId].costAmountSend += itemSend.costAmount
        productIdMapValue[productId].actualAmountSend += itemSend.quantity * itemSend.actualPrice

        if (batchId != 0) {
          if (!batchIdMapValue[batchId]) {
            batchIdMapValue[batchId] = {
              quantityReturn: 0,
              quantitySend: 0,
              openQuantity: 0,
              actualAmountReturn: 0,
              actualAmountSend: 0,
            }
          }
          batchIdMapValue[batchId].quantitySend += itemSend.quantity
          batchIdMapValue[batchId].actualAmountSend
            += itemSend.quantity * itemSend.actualPrice
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}
      const productIdEntriesValue = Object.entries(productIdMapValue).filter(([productId, v]) => {
        return (
          v.quantityReturn != v.quantitySend
          || v.costAmountReturn != v.costAmountSend
          || v.actualAmountReturn != v.actualAmountSend
        )
      })
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
            .map(([productId, v]) => {
              return (
                `(${productId}, ${v.quantitySend - v.quantityReturn},`
                + ` ${v.costAmountSend - v.costAmountReturn})`
              )
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
      const batchIdEntriesValue = Object.entries(batchIdMapValue).filter(([batchId, v]) => {
        return v.quantityReturn != v.quantitySend || v.actualAmountReturn != v.actualAmountSend
      })

      if (batchIdEntriesValue.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
        UPDATE  "Batch" "batch"
        SET     "quantity" = "batch"."quantity" - temp."quantitySend"
        FROM    (VALUES `
          + batchIdEntriesValue
            .map(([batchId, v]) => `(${batchId}, ${v.quantitySend - v.quantityReturn})`)
            .join(', ')
          + `   ) AS temp("batchId", "quantitySend")
        WHERE   "batch"."id" = temp."batchId" 
            AND "batch"."oid" = ${oid}
            AND "batch"."quantity" >= temp."quantitySend"
        RETURNING "batch".*;        
        `
        )
        // Kết quả: "KHÔNG" cho phép số lượng âm
        if (batchUpdateResult[1] != batchIdEntriesValue.length) {
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
        const currentMap = productIdMapValue[i.id]
        currentMap.hasManageQuantity = i.hasManageQuantity
        if (currentMap.hasManageQuantity == 0) {
          currentMap.openQuantity = 0
          currentMap.openCostAmount = 0
          currentMap.quantitySend = 0
          currentMap.costAmountSend = 0
          currentMap.quantityReturn = 0
          currentMap.costAmountReturn = 0
        } else {
          currentMap.openQuantity = i.quantity + currentMap.quantitySend - currentMap.quantityReturn
          currentMap.openCostAmount =
            i.costAmount + currentMap.costAmountSend - currentMap.costAmountReturn
        }
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMapValue[i.id]
        currentMap.openQuantity = i.quantity + currentMap.quantitySend - currentMap.quantityReturn
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementListDraft: ProductMovementInsertType[] = []
      productIdEntriesValue.forEach(([productId, v]) => {
        ticketProductReturnList
          .filter((i) => i.productId === Number(productId))
          .forEach((ticketProductReturn) => {
            const quantityReturn = v.hasManageQuantity ? ticketProductReturn.quantity : 0 // không lấy theo "v" được vì nó đã group nhiều record theo productId
            const costAmountReturn = v.hasManageQuantity ? ticketProductReturn.costAmount : 0

            const draft: ProductMovementInsertType = {
              oid,
              productId: Number(productId),
              voucherId: ticketId,
              contactId: customerId,
              voucherType: VoucherType.Ticket,
              isRefund: 1,
              createdAt: time,
              unitRate: ticketProductReturn.unitRate,
              actualPrice: ticketProductReturn.actualPrice,
              expectedPrice: ticketProductReturn.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: ticketProductReturn.quantity, // luôn lấy số lượng trong đơn
              closeQuantity: v.openQuantity + quantityReturn, // cộng hoặc trừ theo số lượng thực tế
              openCostAmount: v.openCostAmount,
              costAmount: ticketProductReturn.costAmount,
              closeCostAmount: v.openCostAmount + costAmountReturn,
            }
            productMovementListDraft.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
            v.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy
          })
        ticketProductSendList
          .filter((i) => i.productId === Number(productId))
          .forEach((ticketProductSend) => {
            const quantitySend = v.hasManageQuantity ? ticketProductSend.quantity : 0 // không lấy theo "v" được vì nó đã group nhiều record theo productId
            const costAmountSend = v.hasManageQuantity ? ticketProductSend.costAmount : 0

            const draft: ProductMovementInsertType = {
              oid,
              productId: Number(productId),
              voucherId: ticketId,
              contactId: customerId,
              voucherType: VoucherType.Ticket,
              isRefund: 0,
              createdAt: time,
              unitRate: ticketProductSend.unitRate,
              actualPrice: ticketProductSend.actualPrice,
              expectedPrice: ticketProductSend.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: -ticketProductSend.quantity, // luôn lấy số lượng trong đơn
              closeQuantity: v.openQuantity - quantitySend, // cộng hoặc trừ theo số lượng thực tế
              openCostAmount: v.openCostAmount,
              costAmount: -ticketProductSend.costAmount,
              closeCostAmount: v.openCostAmount - costAmountSend,
            }
            productMovementListDraft.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
            v.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy
          })
      })
      if (productMovementListDraft.length) {
        await manager.insert(ProductMovement, productMovementListDraft)
      }

      // 9. === CREATE: BATCH_MOVEMENT ===
      const batchMovementListDraft: BatchMovementInsertType[] = []
      batchIdEntriesValue.forEach(([batchId, v]) => {
        ticketProductReturnList
          .filter((i) => i.batchId === Number(batchId))
          .forEach((ticketProductReturn) => {
            const quantityReturn = ticketProductReturn.quantity // không lấy theo "v" được vì nó đã group nhiều record theo productId
            const draft: BatchMovementInsertType = {
              oid,
              productId: ticketProductReturn.productId,
              batchId: Number(batchId),
              voucherId: ticketId,
              contactId: customerId,
              voucherType: VoucherType.Ticket,
              isRefund: 1,
              createdAt: time,
              unitRate: ticketProductReturn.unitRate,
              actualPrice: ticketProductReturn.actualPrice,
              expectedPrice: ticketProductReturn.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: quantityReturn,
              closeQuantity: v.openQuantity + quantityReturn,
            }
            batchMovementListDraft.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          })
        ticketProductSendList
          .filter((i) => i.batchId === Number(batchId))
          .forEach((ticketProductSend) => {
            const quantitySend = ticketProductSend.quantity // không lấy theo "v" được vì nó đã group nhiều record theo batchId

            const draft: BatchMovementInsertType = {
              oid,
              productId: ticketProductSend.productId,
              batchId: Number(batchId),
              voucherId: ticketId,
              contactId: customerId,
              voucherType: VoucherType.Ticket,
              isRefund: 0,
              createdAt: time,
              unitRate: ticketProductSend.unitRate,
              actualPrice: ticketProductSend.actualPrice,
              expectedPrice: ticketProductSend.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: -ticketProductSend.quantity,
              closeQuantity: v.openQuantity - quantitySend,
            }
            batchMovementListDraft.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          })
      })

      if (batchMovementListDraft.length) {
        await manager.insert(BatchMovement, batchMovementListDraft)
      }

      return { ticketBasic, productList, batchList }
    })
  }
}
