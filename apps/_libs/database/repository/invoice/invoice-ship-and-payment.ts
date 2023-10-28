import { Injectable } from '@nestjs/common'
import { DataSource, In, Raw } from 'typeorm'
import { uniqueArray } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { InvoiceItemType, InvoiceStatus, MovementType, PaymentType } from '../../common/variable'
import { Batch, Customer, CustomerPayment, Invoice, ProductMovement } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class InvoiceShipAndPayment {
  constructor(private dataSource: DataSource) {}

  async startShipAndPayment(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
  }) {
    const { oid, invoiceId, time, money } = params
    if (money < 0) {
      throw new Error(`Ship and Payment Invoice ${invoiceId} failed: Money number invalid`)
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Lưu invoice trước để tạo lock

      const invoiceUpdateResult = await manager.getRepository(Invoice).update(
        {
          id: invoiceId,
          oid,
          status: In([InvoiceStatus.Draft, InvoiceStatus.AwaitingShipment]),
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${InvoiceStatus.Success} 
                            ELSE ${InvoiceStatus.Debt}
                            END
                        `,
          debt: () => `revenue - paid - ${money}`,
          paid: () => `paid + ${money}`,
          startedAt: time,
          shippedAt: time,
          shipYear: DTimer.info(time, 7).year,
          shipMonth: DTimer.info(time, 7).month + 1,
          shipDate: DTimer.info(time, 7).date,
        }
      )
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
      }

      const [invoice] = await manager.find(Invoice, {
        relations: { invoiceItems: true },
        relationLoadStrategy: 'join',
        where: { oid, id: invoiceId },
      })
      if (invoice.invoiceItems.length === 0) {
        throw new Error(`Process Invoice ${invoiceId} failed: invoiceItems.length = 0`)
      }

      // Có nợ => thêm nợ vào khách hàng
      if (invoice.debt) {
        const updateCustomer = await manager.increment<Customer>(
          Customer,
          { id: invoice.customerId, oid },
          'debt',
          invoice.debt
        )
        if (updateCustomer.affected !== 1) {
          throw new Error(
            `Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`
          )
        }
      }

      const customer = await manager.findOneBy(Customer, {
        oid,
        id: invoice.customerId,
      })
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt - invoice.debt
      const invoiceCloseDebt = invoice.debt
      const invoiceOpenDebt = invoiceCloseDebt + money

      // Lưu lịch sử trả tiền vào customerPayment
      const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
        oid,
        customerId: invoice.customerId,
        invoiceId,
        createdAt: time,
        type: PaymentType.ImmediatePayment,
        paid: money,
        debit: invoice.debt,
        customerOpenDebt,
        customerCloseDebt,
        invoiceOpenDebt,
        invoiceCloseDebt,
      })
      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `Create CustomerPayment failed: ` +
            `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      // Trừ số lượng vào lô hàng và sản phẩm
      const invoiceItemsBatch = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.Batch)
      const invoiceItemsProduct = invoice.invoiceItems.filter((i) => {
        return i.type === InvoiceItemType.Product || i.type === InvoiceItemType.Batch
      })
      const invoiceItemsProductNoMangeQuantity = invoice.invoiceItems.filter((i) => {
        return i.type === InvoiceItemType.ProductNoManageQuantity
      })
      let productIds: number[] = []

      // Lô hàng
      if (invoiceItemsBatch.length) {
        const invoiceItemIds = invoiceItemsBatch.map((i) => i.id)
        const batchIds = uniqueArray(invoiceItemsBatch.map((i) => i.batchId))
        // update trước để lock các bản ghi của productBatch
        const [batchList, batchAffectedRows]: [Batch[], number] = await manager.query(`
            UPDATE  "Batch" "batch" 
            SET     "quantity" = "quantity" - "sii"."sumQuantity",
                    "costAmount" = "costAmount" - "sii"."sumCostAmount"
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
          batch.quantity = Number(batch.quantity) + invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
          batch.costAmount = Number(batch.costAmount) + invoiceItem.costAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

          const batchMovementDraft: BatchMovementInsertType = {
            oid,
            batchId: batch.id,
            productId: batch.productId,
            referenceId: invoiceId,
            createdAt: time,
            type: MovementType.Invoice,
            isRefund: 0,
            unit: invoiceItem.unit,
            price: invoiceItem.actualPrice,
            openQuantity: batch.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: -invoiceItem.quantity,
            closeQuantity: batch.quantity - invoiceItem.quantity,
            openCostAmount: batch.costAmount,
            costAmount: -invoiceItem.costAmount,
            closeCostAmount: batch.costAmount - invoiceItem.costAmount,
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
            SET     "quantity" = "quantity" - "sii"."sumQuantity",
                    "costAmount" = "costAmount" - "sii"."sumCostAmount"
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
          product.quantity = Number(product.quantity) + invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
          product.costAmount = Number(product.costAmount) + invoiceItem.costAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

          const productMovementDraft: ProductMovementInsertType = {
            oid,
            productId: product.id,
            referenceId: invoiceId,
            createdAt: time,
            type: MovementType.Invoice,
            isRefund: 0,
            unit: invoiceItem.unit,
            price: invoiceItem.actualPrice,
            openQuantity: product.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: -invoiceItem.quantity,
            closeQuantity: product.quantity - invoiceItem.quantity,
            openCostAmount: product.costAmount,
            costAmount: -invoiceItem.costAmount,
            closeCostAmount: product.costAmount - invoiceItem.costAmount,
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
            quantity: -invoiceItem.quantity,
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

      return { productIds }
    })

    return {
      invoiceId,
      productIds: transaction.productIds,
    }
  }
}
