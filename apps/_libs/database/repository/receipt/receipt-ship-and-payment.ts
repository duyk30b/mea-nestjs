import { Injectable } from '@nestjs/common'
import { DataSource, In, Raw } from 'typeorm'
import { uniqueArray } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { MovementType, PaymentType, ReceiptStatus } from '../../common/variable'
import {
  Batch,
  Distributor,
  DistributorPayment,
  Product,
  ProductMovement,
  Receipt,
} from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class ReceiptShipAndPayment {
  constructor(private dataSource: DataSource) {}

  async startShipAndPayment(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }) {
    const { oid, receiptId, time, money } = params
    if (money < 0) {
      throw new Error(`Ship and Payment Receipt ${receiptId} failed: Money number invalid`)
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Lưu receipt trước để tạo lock
      const receiptUpdateResult = await manager.getRepository(Receipt).update(
        {
          id: receiptId,
          oid,
          status: In([ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment]),
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${ReceiptStatus.Success} 
                            ELSE ${ReceiptStatus.Debt}
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
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
      }

      const [receipt] = await manager.find(Receipt, {
        relations: { receiptItems: true },
        relationLoadStrategy: 'join',
        where: { oid, id: receiptId },
      })
      if (receipt.receiptItems.length === 0) {
        throw new Error(`Process Receipt ${receiptId} failed: receiptItems.length = 0`)
      }

      // Có nợ => thêm nợ vào NCC
      if (receipt.debt) {
        const updateDistributorResult = await manager.increment<Distributor>(
          Distributor,
          { id: receipt.distributorId },
          'debt',
          receipt.debt
        )
        if (updateDistributorResult.affected !== 1) {
          throw new Error(
            `Payment Receipt ${receiptId} failed: ` +
              `Update distributor ${receipt.distributorId} invalid`
          )
        }
      }

      const distributor = await manager.findOneBy(Distributor, {
        oid,
        id: receipt.distributorId,
      })
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt - receipt.debt
      const receiptCloseDebt = receipt.debt
      const receiptOpenDebt = receiptCloseDebt + money

      // Lưu lịch sử trả tiền vào distributorPayment
      const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        type: PaymentType.ImmediatePayment,
        paid: money,
        debit: receipt.debt,
        distributorOpenDebt,
        distributorCloseDebt,
        receiptOpenDebt,
        receiptCloseDebt,
      })
      const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
      if (!distributorPaymentId) {
        throw new Error(
          `Create DistributorPayment failed: ` +
            `Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
        )
      }

      // Cộng số lượng vào lô hàng và sản phẩm
      const receiptItemsBatch = receipt.receiptItems.filter((i) => i.batchId != 0)
      const receiptItemsProduct = receipt.receiptItems.filter((i) => i.productId != 0)
      let productIds: number[] = []
      // Lô hàng
      if (receiptItemsBatch.length) {
        const receiptItemIds = receiptItemsBatch.map((i) => i.id)
        const batchIds = uniqueArray(receiptItemsBatch.map((i) => i.batchId))
        // update trước để lock các bản ghi của batch
        const [batchList, batchAffectedRows]: [Batch[], number] = await manager.query(`
            UPDATE  "Batch" "batch" 
            SET     "quantity" = "quantity" + "sri"."sumQuantity",
                    "costAmount" = "costAmount" + "sri"."sumCostAmount"
            FROM    ( 
                        SELECT "batchId", 
                            SUM("quantity") as "sumQuantity", 
                            SUM("costPrice" * "quantity") as "sumCostAmount"
                        FROM "ReceiptItem" "receiptItem"
                        WHERE "receiptItem"."id" IN (${receiptItemIds.toString()})
                            AND "receiptItem"."receiptId" = ${receipt.id} 
                            AND "receiptItem"."oid" = ${oid}
                        GROUP BY "batchId"
                    ) AS sri 
            WHERE   "batch"."id" = "sri"."batchId"
                    AND "batch"."id" IN (${batchIds.toString()})
                    AND "batch"."oid" = ${oid}
            RETURNING *
        `)
        if (batchAffectedRows !== batchIds.length) {
          throw new Error(`Process Receipt ${receiptId} failed: Some batch can't update quantity`)
        }

        const batchMovementsDraft = receiptItemsBatch.map((receiptItem) => {
          const batch = batchList.find((i) => i.id === receiptItem.batchId)
          if (!batch) {
            throw new Error(
              `Process Receipt ${receiptId} failed: ProductID ${receiptItem.batchId} invalid`
            )
          }
          const receiptItemCostAmount = receiptItem.quantity * receiptItem.costPrice
          // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
          batch.quantity = Number(batch.quantity) - receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
          batch.costAmount = Number(batch.costAmount) - receiptItemCostAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

          const batchMovementDraft: BatchMovementInsertType = {
            oid,
            batchId: batch.id,
            productId: batch.productId,
            referenceId: receiptId,
            createdAt: time,
            type: MovementType.Receipt,
            isRefund: 0,
            unit: receiptItem.unit,
            price: batch.costPrice,
            openQuantity: batch.quantity,
            quantity: receiptItem.quantity,
            closeQuantity: batch.quantity + receiptItem.quantity,
            openCostAmount: batch.costAmount,
            costAmount: receiptItemCostAmount,
            closeCostAmount: batch.costAmount + receiptItemCostAmount,
          }
          return batchMovementDraft
        })
        await manager.insert(BatchMovement, batchMovementsDraft.reverse())
      }

      // Sản phẩm
      if (receiptItemsProduct.length) {
        const receiptItemIds = receiptItemsProduct.map((i) => i.id)
        productIds = uniqueArray(receiptItemsProduct.map((i) => i.productId))
        // update trước để lock các bản ghi của product
        const [productList, productAffectedRows]: [Product[], number] = await manager.query(`
            UPDATE  "Product" "product" 
            SET     "quantity" = "quantity" + "sri"."sumQuantity",
                    "costAmount" = "costAmount" + "sri"."sumCostAmount"
            FROM    ( 
                        SELECT "productId",
                            SUM("quantity") as "sumQuantity", 
                            SUM("costPrice" * "quantity") as "sumCostAmount"
                        FROM "ReceiptItem" "receiptItem"
                        WHERE "receiptItem"."id" IN (${receiptItemIds.toString()})
                            AND "receiptItem"."receiptId" = ${receipt.id} 
                            AND "receiptItem"."oid" = ${oid}
                        GROUP BY "productId"
                    ) AS sri 
            WHERE   "product"."id" = "sri"."productId"
                    AND "product"."id" IN (${productIds.toString()})
                    AND "product"."hasManageQuantity" = 1
                    AND "product"."oid" = ${oid}
            RETURNING *
        `)

        if (productAffectedRows !== productIds.length) {
          throw new Error(
            `Line 169: Process Receipt ${receiptId} failed: Some product can't update quantity`
          )
        }

        const productMovementDraftList = receiptItemsProduct.map((receiptItem) => {
          const product = productList.find((i) => i.id === receiptItem.productId)
          if (!product) {
            throw new Error(
              `Process Receipt ${receiptId} failed: ProductID ${receiptItem.productId} invalid`
            )
          }
          // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
          const receiptItemCostAmount = receiptItem.quantity * receiptItem.costPrice
          product.quantity = Number(product.quantity) - receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
          product.costAmount = Number(product.costAmount) - receiptItemCostAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

          const productMovementDraft: ProductMovementInsertType = {
            oid,
            productId: product.id,
            referenceId: receiptId,
            createdAt: time,
            type: MovementType.Receipt,
            isRefund: 0,
            unit: receiptItem.unit,
            price: product.costPrice,
            openQuantity: product.quantity,
            quantity: receiptItem.quantity,
            closeQuantity: product.quantity + receiptItem.quantity,
            openCostAmount: product.costAmount,
            costAmount: receiptItemCostAmount,
            closeCostAmount: product.costAmount + receiptItemCostAmount,
          }

          return productMovementDraft
        })
        await manager.insert(ProductMovement, productMovementDraftList.reverse())
      }

      return { productIds }
    })

    return {
      receiptId,
      productIds: transaction.productIds,
    }
  }
}
