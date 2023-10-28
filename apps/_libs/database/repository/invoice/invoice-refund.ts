import { Injectable } from '@nestjs/common'
import { DataSource, In } from 'typeorm'
import { uniqueArray } from '../../../common/helpers/object.helper'
import { InvoiceItemType, InvoiceStatus, MovementType, PaymentType } from '../../common/variable'
import {
  Batch,
  Customer,
  CustomerPayment,
  Invoice,
  InvoiceItem,
  Product,
  ProductMovement,
} from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class InvoiceRefund {
  constructor(private dataSource: DataSource) {}

  async startRefund(params: { oid: number; invoiceId: number; time: number }) {
    const { oid, invoiceId, time } = params

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // Check trạng thái invoice đầu tiên
      const [invoice] = await manager.find(Invoice, {
        relations: { invoiceItems: true },
        relationLoadStrategy: 'join',
        where: {
          id: invoiceId,
          oid,
          status: In([InvoiceStatus.AwaitingShipment, InvoiceStatus.Debt, InvoiceStatus.Success]),
        },
      })
      if (!invoice || invoice.invoiceItems.length === 0) {
        throw new Error(`Refund Invoice ${invoiceId} failed: invoiceItems.length = 0 `)
      }

      const invoiceUpdateResult = await manager.update(
        Invoice,
        {
          id: invoiceId,
          oid,
          status: In([InvoiceStatus.AwaitingShipment, InvoiceStatus.Debt, InvoiceStatus.Success]),
        },
        {
          status: InvoiceStatus.Refund,
          paid: 0,
          debt: 0,
        }
      )
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Refund Invoice ${invoiceId} failed: Invoice ${invoiceId} invalid`)
      }

      // Hoàn trả nợ vào khách hàng nếu có
      if (invoice.debt !== 0) {
        const updateCustomerResult = await manager.decrement<Customer>(
          Customer,
          { id: invoice.customerId, oid },
          'debt',
          invoice.debt
        )
        if (updateCustomerResult.affected !== 1) {
          throw new Error(
            `Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`
          )
        }
      }

      const customer = await manager.findOneBy(Customer, {
        oid,
        id: invoice.customerId,
      })

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + invoice.debt
      const invoiceOpenDebt = invoice.debt

      // Lưu lịch sử nhận hoàn tiền hoặc hoàn nợ
      // Luôn luôn có lịch sử: vì nếu đã thanh toán thì nhận lại tiền, còn nếu chưa thanh toán thì nhận hoàn nợ
      const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
        oid,
        customerId: invoice.customerId,
        invoiceId,
        createdAt: time,
        type: PaymentType.ReceiveRefund,
        paid: -invoice.paid,
        debit: -invoice.debt,
        customerOpenDebt,
        customerCloseDebt,
        invoiceOpenDebt,
        invoiceCloseDebt: 0,
      })

      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `Create CustomerPayment failed: ` +
            `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      // Cộng số lượng vào lô hàng và sản phẩm
      const invoiceItemsBatch = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.Batch)
      const invoiceItemsProduct = invoice.invoiceItems.filter((i) => {
        return i.type === InvoiceItemType.Product || i.type === InvoiceItemType.Batch
      })
      const invoiceItemsProductNoMangeQuantity = invoice.invoiceItems.filter((i) => {
        return i.type === InvoiceItemType.ProductNoManageQuantity
      })
      let productIds: number[] = []

      // Nếu đã gửi hàng thì phải trả hàng
      if ([InvoiceStatus.Debt, InvoiceStatus.Success].includes(invoice.status)) {
        // Lô hàng
        if (invoiceItemsBatch.length) {
          const invoiceItemIds = invoiceItemsBatch.map((i) => i.id)
          const batchIds = uniqueArray(invoiceItemsBatch.map((i) => i.batchId))
          // update trước để lock các bản ghi của productBatch
          const [batchList, batchAffectedRows]: [Batch[], number] = await manager.query(`
              UPDATE  "Batch" "batch" 
              SET     "quantity" = "quantity" + "sii"."sumQuantity",
                      "costAmount" = "costAmount" + "sii"."sumCostAmount"
              FROM    ( 
                          SELECT "batchId", 
                              SUM("quantity") as "sumQuantity",
                              SUM("costAmount") as "sumCostAmount"
                          FROM "InvoiceItem" "invoiceItem"
                          WHERE "invoiceItem"."id" IN (${invoiceItemIds.toString()})
                              AND "invoiceItem"."invoiceId" = ${invoiceId}
                              AND "invoiceItem"."oid" = ${oid}
                          GROUP BY "batchId"
                      ) AS sii 
              WHERE   "batch"."id" = "sii"."batchId"
                      AND "batch"."id" IN (${batchIds.toString()})
                      AND "batch"."oid" = ${oid}
              RETURNING *
          `)

          if (batchAffectedRows !== batchIds.length) {
            throw new Error(`Process Invoice ${invoiceId} failed: Some batch can't update quantity`)
          }

          const batchMovementsDraft = invoiceItemsBatch.map((invoiceItem) => {
            const batch = batchList.find((i) => i.id === invoiceItem.batchId)
            if (!batch) {
              throw new Error(
                `Process Invoice ${invoiceId} failed: BatchID ${invoiceItem.batchId} invalid`
              )
            }
            // cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
            batch.quantity = Number(batch.quantity) - invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
            batch.costAmount = Number(batch.costAmount) - invoiceItem.costAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

            const batchMovementDraft: BatchMovementInsertType = {
              oid,
              batchId: batch.id,
              productId: batch.productId,
              referenceId: invoiceId,
              createdAt: time,
              type: MovementType.Invoice,
              isRefund: 1,
              unit: invoiceItem.unit,
              price: invoiceItem.actualPrice,
              openQuantity: batch.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
              quantity: invoiceItem.quantity,
              closeQuantity: batch.quantity + invoiceItem.quantity,
              openCostAmount: batch.costAmount,
              costAmount: invoiceItem.costAmount,
              closeCostAmount: batch.costAmount + invoiceItem.costAmount,
            }
            return batchMovementDraft
          })
          await manager.insert(BatchMovement, batchMovementsDraft.reverse())
        }

        const productMovementsDraft: ProductMovementInsertType[] = []
        // Sản phẩm có quản lý số lượng
        if (invoiceItemsProduct.length) {
          const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
          productIds = uniqueArray(invoiceItemsProduct.map((i) => i.productId))
          // update trước để lock các bản ghi của productBatch
          const [productList, productAffectedRows]: [Batch[], number] = await manager.query(`
              UPDATE  "Product" "product" 
              SET     "quantity" = "quantity" + "sii"."sumQuantity",
                      "costAmount" = "costAmount" + "sii"."sumCostAmount"
              FROM    ( 
                          SELECT "productId", 
                              SUM("quantity") as "sumQuantity",
                              SUM("costAmount") as "sumCostAmount"
                          FROM "InvoiceItem" "invoiceItem"
                          WHERE "invoiceItem"."id" IN (${invoiceItemIds.toString()})
                              AND "invoiceItem"."invoiceId" = ${invoiceId}
                              AND "invoiceItem"."oid" = ${oid}
                          GROUP BY "productId"
                      ) AS sii 
              WHERE   "product"."id" = "sii"."productId"
                      AND "product"."id" IN (${productIds.toString()})
                      AND "product"."hasManageQuantity" = 1
                      AND "product"."oid" = ${oid}
              RETURNING *
          `)

          if (productAffectedRows !== productIds.length) {
            throw new Error(`Process Invoice ${invoiceId} failed: Some batch can't update quantity`)
          }

          invoiceItemsProduct.forEach((invoiceItem) => {
            const product = productList.find((i) => i.id === invoiceItem.productId)
            if (!product) {
              throw new Error(
                `Process Invoice ${invoiceId} failed: ProductID ${invoiceItem.productId} invalid`
              )
            }
            // cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
            product.quantity = Number(product.quantity) - invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
            product.costAmount = Number(product.costAmount) - invoiceItem.costAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

            const productMovementDraft: ProductMovementInsertType = {
              oid,
              productId: product.id,
              referenceId: invoiceId,
              createdAt: time,
              type: MovementType.Invoice,
              isRefund: 1,
              unit: invoiceItem.unit,
              price: invoiceItem.actualPrice,
              openQuantity: product.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
              quantity: invoiceItem.quantity,
              closeQuantity: product.quantity + invoiceItem.quantity,
              openCostAmount: product.costAmount,
              costAmount: invoiceItem.costAmount,
              closeCostAmount: product.costAmount + invoiceItem.costAmount,
            }
            productMovementsDraft.push(productMovementDraft)
          })
        }

        // Sản phẩm KHÔNG quản lý số lượng
        if (invoiceItemsProductNoMangeQuantity.length) {
          invoiceItemsProductNoMangeQuantity.forEach((invoiceItem) => {
            const productMovementDraft: ProductMovementInsertType = {
              oid,
              productId: invoiceItem.productId,
              referenceId: invoiceId,
              createdAt: time,
              type: MovementType.Invoice,
              isRefund: 0,
              openQuantity: 0, // quantity đã được trả đúng số lượng ban đầu ở trên
              quantity: invoiceItem.quantity,
              unit: invoiceItem.unit,
              closeQuantity: 0,
              price: invoiceItem.actualPrice,
              costAmount: 0,
              closeCostAmount: 0,
              openCostAmount: 0,
            }
            productMovementsDraft.push(productMovementDraft)
          })
        }
        if (productMovementsDraft.length) {
          await manager.insert(ProductMovement, productMovementsDraft.reverse())
        }
      }

      return { productIds }
    })

    return {
      invoiceId,
      productIds: transaction.productIds,
    }
  }
}
