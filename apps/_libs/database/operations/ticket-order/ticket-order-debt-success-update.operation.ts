import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import {
  DataSource,
  EntityManager,
} from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus, MovementType, PaymentType } from '../../common/variable'
import {
  Batch,
  Customer,
  CustomerPayment,
  Product,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
} from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import ProductMovement, { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketExpenseInsertType } from '../../entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../entities/ticket-surcharge.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  CustomerPaymentManager,
  ProductMovementManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
} from '../../managers'
import {
  TicketOrderDebtSuccessUpdateType,
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

@Injectable()
export class TicketOrderDebtSuccessUpdateOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private productMovementManager: ProductMovementManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
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
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Debt, TicketStatus.Completed] },
        },
        { updatedAt: Date.now() }
      )

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          ...(ticketOrderDebtSuccessUpdate as object),
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
      )
      const { customerId } = ticketOrigin

      // === 2. INSERT CUSTOMER_PAYMENT  ===
      let customer: Customer = null
      const customerPayment: CustomerPayment = null
      if (ticket.debt != ticketOrigin.debt || ticket.paid != ticketOrigin.paid) {
        const debtChange = ticket.debt - ticketOrigin.debt
        const paidChange = ticket.paid - ticketOrigin.paid
        if (debtChange != 0) {
          customer = await this.customerManager.updateOneAndReturnEntity(
            manager,
            { oid, id: customerId },
            { debt: () => `debt + ${debtChange}` }
          )
        } else {
          customer = await this.customerManager.findOneBy(manager, { oid, id: customerId })
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
        const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
          manager,
          customerPaymentInsert
        )
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
            deliveryStatus: DeliveryStatus.Delivered, // cho xử lý xong luôn
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        ticketProductSendList = await this.ticketProductManager.insertManyAndReturnEntity(
          manager,
          ticketProductListInsert
        )
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
        await this.ticketProcedureManager.insertMany(manager, ticketProcedureListInsert)
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
      const productCalculatorMap: Record<
        string,
        {
          openQuantity: number
          quantityGroupReturn: number
          quantityGroupSend: number
          allowChangeQuantity: boolean
        }
      > = {}
      const batchCalculatorMap: Record<
        string,
        {
          openQuantity: number
          quantityGroupReturn: number
          quantityGroupSend: number
        }
      > = {}
      for (let i = 0; i < ticketProductReturnList.length; i++) {
        const { productId, batchId, quantity } = ticketProductReturnList[i]

        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            openQuantity: 0,
            quantityGroupReturn: 0,
            quantityGroupSend: 0,
            allowChangeQuantity: true,
          }
        }

        if (batchId == 0) {
          // với batchId = 0 thì thuộc trường hợp không quản lý số lượng tồn kho
          productCalculatorMap[productId].allowChangeQuantity = false
        } else {
          productCalculatorMap[productId].quantityGroupReturn += quantity
          if (!batchCalculatorMap[batchId]) {
            batchCalculatorMap[batchId] = {
              quantityGroupReturn: 0,
              quantityGroupSend: 0,
              openQuantity: 0,
            }
          }
          batchCalculatorMap[batchId].quantityGroupReturn += quantity
        }
      }

      for (let i = 0; i < ticketProductSendList.length; i++) {
        const { productId, batchId, quantity } = ticketProductSendList[i]

        if (!productCalculatorMap[productId]) {
          productCalculatorMap[productId] = {
            openQuantity: 0,
            quantityGroupReturn: 0,
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
            batchCalculatorMap[batchId] = {
              quantityGroupReturn: 0,
              quantityGroupSend: 0,
              openQuantity: 0,
            }
          }
          batchCalculatorMap[batchId].quantityGroupSend += quantity
        }
      }

      // 5. === UPDATE for PRODUCT ===
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}
      const productCalculatorEntries = Object.entries(productCalculatorMap).filter(
        ([productId, v]) => {
          return v.quantityGroupReturn != v.quantityGroupSend
        }
      )
      if (productCalculatorEntries.length) {
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Product" AS "product"
          SET "quantity"  = CASE 
                              WHEN (product."hasManageQuantity" = 0) THEN "product"."quantity" 
                              ELSE "product"."quantity" - temp."quantityGroupSend" 
                                                        + temp."quantityGroupReturn"
                          END
          FROM (VALUES `
          + productCalculatorEntries
            .map(([productId, v]) => {
              return `(${productId}, ${v.quantityGroupSend}, ${v.quantityGroupReturn})`
            })
            .join(', ')
          + `   ) AS temp("productId", "quantityGroupSend", "quantityGroupReturn")
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
      const batchIdEntriesValue = Object.entries(batchCalculatorMap).filter(([batchId, v]) => {
        return v.quantityGroupReturn != v.quantityGroupSend
      })

      if (batchIdEntriesValue.length) {
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE  "Batch" "batch"
          SET     "quantity" = "batch"."quantity" - temp."quantityGroupSend" 
                                                  + temp."quantityGroupReturn"
          FROM    (VALUES `
          + batchIdEntriesValue
            .map(([batchId, v]) => {
              return `(${batchId}, ${v.quantityGroupSend}, ${v.quantityGroupReturn})`
            })
            .join(', ')
          + `   ) AS temp("batchId", "quantityGroupSend", "quantityGroupReturn")
          WHERE   "batch"."id" = temp."batchId" 
              AND "batch"."oid" = ${oid}
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
        const productCalculator = productCalculatorMap[i.id]
        if (!i.hasManageQuantity) {
          productCalculator.allowChangeQuantity = false //  product đã được cập nhật là không quản lý số lượng nữa
          productCalculator.quantityGroupSend = 0
          productCalculator.quantityGroupReturn = 0
        }
        productCalculator.openQuantity =
          i.quantity + productCalculator.quantityGroupSend - productCalculator.quantityGroupSend
      })
      batchList.forEach((i) => {
        const batchCalculator = batchCalculatorMap[i.id]
        batchCalculator.openQuantity =
          i.quantity + batchCalculator.quantityGroupSend - batchCalculator.quantityGroupSend
      })

      // 8. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []
      productCalculatorEntries.forEach(([productId, v]) => {
        ticketProductReturnList
          .filter((i) => i.productId === Number(productId))
          .forEach((ticketProductReturn) => {
            const quantityReturn = v.allowChangeQuantity ? ticketProductReturn.quantity : 0 // không lấy theo "v" được vì nó đã group nhiều record theo productId

            const draft: ProductMovementInsertType = {
              oid,
              warehouseId: ticketProductReturn.warehouseId,
              productId: Number(productId),
              voucherId: ticketId,
              contactId: customerId,
              movementType: MovementType.Ticket,
              isRefund: 1,
              createdAt: time,
              unitRate: ticketProductReturn.unitRate,
              costPrice: ticketProductReturn.costPrice,
              actualPrice: ticketProductReturn.actualPrice,
              expectedPrice: ticketProductReturn.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: ticketProductReturn.quantity, // luôn lấy số lượng trong đơn
              closeQuantity: v.openQuantity + quantityReturn, // cộng hoặc trừ theo số lượng thực tế
            }
            productMovementInsertList.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          })
        ticketProductSendList
          .filter((i) => i.productId === Number(productId))
          .forEach((ticketProductSend) => {
            const quantitySend = v.allowChangeQuantity ? ticketProductSend.quantity : 0 // không lấy theo "v" được vì nó đã group nhiều record theo productId

            const draft: ProductMovementInsertType = {
              oid,
              warehouseId: ticketProductSend.warehouseId,
              productId: Number(productId),
              voucherId: ticketId,
              contactId: customerId,
              movementType: MovementType.Ticket,
              isRefund: 0,
              createdAt: time,
              unitRate: ticketProductSend.unitRate,
              costPrice: ticketProductSend.costPrice,
              actualPrice: ticketProductSend.actualPrice,
              expectedPrice: ticketProductSend.expectedPrice,
              openQuantity: v.openQuantity,
              quantity: -ticketProductSend.quantity, // luôn lấy số lượng trong đơn
              closeQuantity: v.openQuantity - quantitySend, // cộng hoặc trừ theo số lượng thực tế
            }
            productMovementInsertList.push(draft)
            // sau khi lấy rồi cần cập nhật v vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
            v.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          })
      })
      if (productMovementInsertList.length) {
        await manager.insert(ProductMovement, productMovementInsertList)
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
              warehouseId: ticketProductReturn.warehouseId,
              productId: ticketProductReturn.productId,
              batchId: Number(batchId),
              voucherId: ticketId,
              contactId: customerId,
              movementType: MovementType.Ticket,
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
              warehouseId: ticketProductSend.warehouseId,
              productId: ticketProductSend.productId,
              batchId: Number(batchId),
              voucherId: ticketId,
              contactId: customerId,
              movementType: MovementType.Ticket,
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

      return { ticket, productList, batchList }
    })
  }
}
