import { Injectable } from '@nestjs/common'
import { DataSource, In } from 'typeorm'
import { uniqueArray } from '../../../common/helpers/object.helper'
import { MovementType, PaymentType, ReceiptStatus } from '../../common/variable'
import { Batch, Distributor, DistributorPayment, ProductMovement, Receipt } from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class ReceiptRefund {
  constructor(private dataSource: DataSource) {}

  async startRefund(params: { oid: number; receiptId: number; time: number }) {
    const { oid, receiptId, time } = params
    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      const [receipt] = await manager.find(Receipt, {
        relations: { receiptItems: true },
        relationLoadStrategy: 'join',
        where: {
          oid,
          id: receiptId,
          status: In([ReceiptStatus.AwaitingShipment, ReceiptStatus.Debt, ReceiptStatus.Success]),
        },
      })
      if (!receipt || receipt.receiptItems.length === 0) {
        throw new Error(`Refund Receipt ${receiptId} failed: receiptItems.length = 0 `)
      }

      const receiptUpdateResult = await manager.update(
        Receipt,
        {
          id: receiptId,
          oid,
          status: In([ReceiptStatus.AwaitingShipment, ReceiptStatus.Debt, ReceiptStatus.Success]),
        },
        {
          status: ReceiptStatus.Refund,
          debt: 0,
          paid: 0,
        }
      )
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Refund Receipt ${receiptId} failed: Receipt ${receiptId} invalid`)
      }

      // Hoàn trả nợ vào NCC nếu có
      if (receipt.debt !== 0) {
        const updateDistributor = await manager.decrement<Distributor>(
          Distributor,
          { id: receipt.distributorId },
          'debt',
          receipt.debt
        )
        if (updateDistributor.affected !== 1) {
          throw new Error(
            `Refund Receipt ${receiptId} failed: ` +
              `Update distributor ${receipt.distributorId} invalid`
          )
        }
      }

      const distributor = await manager.findOneBy(Distributor, {
        oid,
        id: receipt.distributorId,
      })
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt + receipt.debt
      const receiptOpenDebt = receipt.debt

      // Lưu lịch sử nhận hoàn tiền hoặc hoàn nợ
      // Luôn luôn có lịch sử: vì nếu đã thanh toán thì nhận lại tiền, còn nếu chưa thanh toán thì nhận hoàn nợ
      const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        type: PaymentType.ReceiveRefund,
        paid: -receipt.paid,
        debit: -receipt.debt,
        distributorOpenDebt,
        distributorCloseDebt,
        receiptOpenDebt,
        receiptCloseDebt: 0,
      })

      const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
      if (!distributorPaymentId) {
        throw new Error(
          `Create DistributorPayment failed: ` +
            `Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
        )
      }

      // Nếu đã nhận hàng thì phải trả hàng
      const receiptItemsBatch = receipt.receiptItems.filter((i) => i.batchId != 0)
      const receiptItemsProduct = receipt.receiptItems.filter((i) => i.productId != 0)
      let productIds: number[] = []

      if ([ReceiptStatus.Debt, ReceiptStatus.Success].includes(receipt.status)) {
        // Lô hàng
        if (receiptItemsBatch.length) {
          const receiptItemIds = receiptItemsBatch.map((i) => i.id)
          const batchIds = uniqueArray(receiptItemsBatch.map((i) => i.batchId))
          // update trước để lock các bản ghi của batch
          const [batchList, batchAffectedRows]: [Batch[], number] = await manager.query(`
              UPDATE  "Batch" "batch" 
              SET     "quantity" = "quantity" - "sri"."sumQuantity",
                      "costAmount" = "costAmount" - "sri"."sumCostAmount"
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
            throw new Error(`Refund Receipt ${receiptId} failed: Some batch can't update quantity`)
          }

          const batchMovementDraftList = receiptItemsBatch.map((receiptItem) => {
            const batch = batchList.find((i) => i.id === receiptItem.batchId)
            if (!batch) {
              throw new Error(
                `Refund Receipt ${receiptId} failed: BatchID ${receiptItem.batchId} invalid`
              )
            }
            const receiptItemCostAmount = receiptItem.quantity * receiptItem.costPrice
            // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
            batch.quantity = Number(batch.quantity) + receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
            batch.costAmount = Number(batch.costAmount) + receiptItemCostAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

            const batchMovementDraft: BatchMovementInsertType = {
              oid,
              batchId: batch.id,
              productId: batch.productId,
              referenceId: receiptId,
              createdAt: time,
              type: MovementType.Receipt,
              isRefund: 1,
              unit: receiptItem.unit,
              price: batch.costPrice,
              openQuantity: batch.quantity,
              quantity: -receiptItem.quantity,
              closeQuantity: batch.quantity - receiptItem.quantity,
              openCostAmount: batch.costAmount,
              costAmount: receiptItemCostAmount,
              closeCostAmount: batch.costAmount - receiptItemCostAmount,
            }

            return batchMovementDraft
          })
          await manager.insert(BatchMovement, batchMovementDraftList.reverse())
        }

        // Sản phẩm
        if (receiptItemsProduct.length) {
          const receiptItemIds = receiptItemsProduct.map((i) => i.id)
          productIds = uniqueArray(receiptItemsProduct.map((i) => i.productId))
          // update trước để lock các bản ghi của productBatch
          const [productList, productAffectedRows]: [Batch[], number] = await manager.query(`
              UPDATE  "Product" "product" 
              SET     "quantity" = "quantity" - "sri"."sumQuantity",
                      "costAmount" = "costAmount" - "sri"."sumCostAmount"
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
              `Refund Receipt ${receiptId} failed: Some product can't update quantity`
            )
          }

          const productMovementDraftList = receiptItemsProduct.map((receiptItem) => {
            const product = productList.find((i) => i.id === receiptItem.productId)
            if (!product) {
              throw new Error(
                `Refund Receipt ${receiptId} failed: ProductID ${receiptItem.productId} invalid`
              )
            }
            const receiptItemCostAmount = receiptItem.quantity * receiptItem.costPrice

            // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
            product.quantity = Number(product.quantity) + receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước
            product.costAmount = Number(product.costAmount) + receiptItemCostAmount // trả lại số lượng ban đầu vì ở trên đã bị update trước

            const productMovementDraft: ProductMovementInsertType = {
              oid,
              productId: product.productId,
              referenceId: receiptId,
              createdAt: time,
              type: MovementType.Receipt,
              isRefund: 1,
              unit: receiptItem.unit,
              price: product.costPrice,
              openQuantity: product.quantity,
              quantity: -receiptItem.quantity,
              closeQuantity: product.quantity - receiptItem.quantity,
              openCostAmount: product.costAmount,
              costAmount: receiptItemCostAmount,
              closeCostAmount: product.costAmount - receiptItemCostAmount,
            }

            return productMovementDraft
          })

          await manager.insert(ProductMovement, productMovementDraftList.reverse())
        }
      }

      return { productIds }
    })

    return {
      receiptId,
      productIds: transaction.productIds,
    }
  }
}
