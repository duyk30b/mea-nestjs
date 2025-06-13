import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { ReceiptItem } from '../../entities'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  ReceiptItemManager,
  ReceiptManager,
} from '../../managers'
import { ProductPutawayOperation } from '../product/product-putaway.operation'

@Injectable()
export class ReceiptSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private productMovementManager: ProductMovementManager,
    private productPutawayOperation: ProductPutawayOperation
  ) { }

  async sendProduct(params: { oid: number; userId: number; receiptId: number; time: number }) {
    const { oid, userId, receiptId, time } = params
    const PREFIX = `ReceiptId=${receiptId} ship and payment failed`

    try {
      const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        // === 1. RECEIPT: initData ===
        const receipt = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          {
            oid,
            id: receiptId,
            status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Executing] },
          },
          { status: ReceiptStatus.Executing, deliveryStatus: DeliveryStatus.Delivered }
        )
        const receiptItemOriginList = await this.receiptItemManager.findManyBy(manager, {
          oid,
          receiptId,
        })
        if (receiptItemOriginList.length === 0) return { receipt }

        const receiptItemOriginMap = ESArray.arrayToKeyValue(receiptItemOriginList, 'id')

        // === 2. Product and Batch origin
        const productIdList = receiptItemOriginList.map((i) => i.productId)
        const batchIdList = receiptItemOriginList.map((i) => i.batchId)
        const productOriginList = await this.productManager.updateAndReturnEntity(
          manager,
          { oid, id: { IN: ESArray.uniqueArray(productIdList) }, isActive: 1 },
          { updatedAt: time }
        )
        const batchOriginList = await this.batchManager.updateAndReturnEntity(
          manager,
          { oid, id: { IN: ESArray.uniqueArray(batchIdList) }, isActive: 1 },
          { updatedAt: time }
        )
        const putawayContainer = this.productPutawayOperation.generatePutawayPlan({
          productOriginList,
          batchOriginList,
          voucherBatchList: receiptItemOriginList.map((i) => {
            return {
              ...i,
              voucherProductId: i.id,
              warehouseId: i.warehouseId,
              voucherBatchId: 0, // receipt không sử dụng, receipt chỉ sử dụng receiptProduct
              costAmount: i.costPrice * i.quantity,
            }
          }),
        })

        // === 3. Update Product and Batch ===
        const productModifiedList = await this.productManager.bulkUpdate({
          manager,
          condition: { oid },
          compare: ['id'],
          tempList: putawayContainer.putawayProductList.map((i) => {
            let receiptItem: ReceiptItem
            receiptItemOriginList.forEach((ri) => {
              if (ri.productId === i.productId) receiptItem = ri // cập nhật giá theo thằng cuối cùng
            })
            return {
              id: i.productId,
              quantity: i.closeQuantity,
              putawayQuantity: i.putawayQuantity, // không được cộng trừ theo thằng này, vì với trường hợp NoImpact nó vẫn nhặt
              costPrice: receiptItem.costPrice,
              retailPrice: receiptItem.listPrice,
            }
          }),
          update: ['quantity', 'costPrice', 'retailPrice'],
          options: { requireEqualLength: true },
        })

        const batchModifiedList = await this.batchManager.bulkUpdate({
          manager,
          condition: { oid },
          compare: ['id', 'productId'],
          tempList: putawayContainer.putawayBatchList
            .filter((i) => !!i.batchId)
            .map((i) => {
              let receiptItem: ReceiptItem
              receiptItemOriginList.forEach((ri) => {
                if (ri.batchId === i.batchId) receiptItem = ri // cập nhật giá theo thằng cuối cùng
              })
              return {
                id: i.batchId,
                productId: i.productId,
                warehouseId: receiptItem.warehouseId,
                distributorId: receiptItem.distributorId,
                lotNumber: receiptItem.lotNumber,
                expiryDate: receiptItem.expiryDate,
                costPrice: receiptItem.costPrice,
                putawayQuantity: i.putawayQuantity,
                putawayCostAmount: i.putawayCostAmount,
              }
            }),
          update: {
            warehouseId: true, // luôn luôn ghi đè
            distributorId: true, // luôn luôn ghi đè
            lotNumber: true,
            expiryDate: { cast: 'bigint' }, // luôn luôn ghi đè
            costPrice: true, // luôn luôn ghi đè
            quantity: () => `"quantity" + "putawayQuantity"`,
            costAmount: () => `"costAmount" + "putawayCostAmount"`,
          },
          options: { requireEqualLength: true },
        })

        // === 4. Insert Movement ===
        const productMovementInsertList = putawayContainer.putawayMovementList.map((paMovement) => {
          const receiptItem = receiptItemOriginMap[paMovement.voucherProductId]
          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Receipt,
            contactId: receipt.distributorId,
            voucherId: receipt.id,
            voucherProductId: receiptItem.id,
            warehouseId: paMovement.warehouseId,
            productId: paMovement.productId,
            batchId: paMovement.batchId,

            createdAt: time,
            isRefund: 0,
            expectedPrice: receiptItem.costPrice,
            actualPrice: receiptItem.costPrice,

            quantity: paMovement.putawayQuantity,
            costAmount: paMovement.putawayCostAmount,
            openQuantityProduct: paMovement.openQuantityProduct,
            closeQuantityProduct: paMovement.closeQuantityProduct,
            openQuantityBatch: paMovement.openQuantityBatch,
            closeQuantityBatch: paMovement.closeQuantityBatch,
            openCostAmountBatch: paMovement.openCostAmountBatch,
            closeCostAmountBatch: paMovement.closeCostAmountBatch,
          }
          return productMovementInsert
        })
        await this.productMovementManager.insertMany(manager, productMovementInsertList)

        return {
          receipt,
          receiptItemList: receiptItemOriginList,
          productList: productModifiedList,
          batchList: batchModifiedList,
        }
      })
      return transaction
    } catch (error) {
      throw error
    }
  }
}
