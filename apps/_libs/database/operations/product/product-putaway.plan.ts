import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { Batch, Product } from '../../entities'

export type PutawayMovement = {
  voucherProductId: string
  voucherBatchId: string
  productId: number
  batchId: number
  warehouseId: number
  putawayQuantity: number
  putawayCostAmount: number
  openQuantityProduct: number
  closeQuantityProduct: number
  openQuantityBatch: number
  closeQuantityBatch: number
  openCostAmountBatch: number
  closeCostAmountBatch: number
}

export type PutawayProduct = {
  productId: number
  putawayQuantity: number
  openQuantity: number
  closeQuantity: number
}

export type PutawayBatch = {
  batchId: number
  productId: number
  putawayQuantity: number
  putawayCostAmount: number
  openQuantity: number
  closeQuantity: number
  openCostAmount: number
  closeCostAmount: number
}

export type PutawayVoucherProduct = {
  voucherProductId: string
  productId: number
  putawayQuantity: number
  putawayCostAmount: number
}

export type PutawayVoucherBatch = {
  voucherProductId: string
  voucherBatchId: string
  productId: number
  batchId: number
  putawayQuantity: number
  putawayCostAmount: number
}

@Injectable()
export class ProductPutawayPlan {
  constructor(private dataSource: DataSource) { }

  generatePutawayPlan(options: {
    productOriginList: Product[]
    batchOriginList: Batch[]
    voucherBatchList: {
      voucherProductId: string
      voucherBatchId: string // cất hàng thì dùng voucherBatch vì đã xác định rõ Batch
      warehouseId: number
      productId: number
      batchId: number
      costAmount: number // cất hàng thì dễ, vì luôn có batchId và costAmount sẵn, chỉ cần xử lý số liệu của costAmount khi bị âm thôi
      quantity: number
    }[]
  }) {
    const { productOriginList, batchOriginList, voucherBatchList } = options

    const productOriginMap = ESArray.arrayToKeyValue(productOriginList, 'id')
    const batchOriginMap = ESArray.arrayToKeyValue(batchOriginList, 'id')

    const productCalcMap: Record<
      string,
      { productId: number; openQuantity: number; product: Product }
    > = {}
    productOriginList.forEach((i) => {
      if (!productCalcMap[i.id]) {
        productCalcMap[i.id] = { productId: i.id, openQuantity: i.quantity, product: i }
      }
    })

    const batchCalcMap: Record<
      string,
      { batchId: number; openQuantity: number; openCostAmount: number; batch: Batch }
    > = {}
    batchOriginList.forEach((i) => {
      if (!batchCalcMap[i.id]) {
        batchCalcMap[i.id] = {
          batchId: i.id,
          openQuantity: i.quantity,
          openCostAmount: i.costAmount,
          batch: i,
        }
      }
    })

    const putawayMovementList: PutawayMovement[] = []
    voucherBatchList.forEach((voucherProduct) => {
      const { productId, batchId, voucherProductId, voucherBatchId, warehouseId } = voucherProduct
      if (!productOriginMap[productId]) {
        throw new Error('Không tìm thấy Product với productId=' + productId)
      }
      if (batchId !== 0 && !batchOriginMap[batchId]) {
        throw new Error('Không tìm thấy Batch với batchId=' + batchId)
      }

      const productCalc = productCalcMap[productId]
      const batchCalc = batchCalcMap[batchId]
      if (batchId === 0) {
        // trường hợp không cộng kho, thì đơn giản chỉ ghi lịch sử rồi thôi
        const putawayQuantity = voucherProduct.quantity
        const pcAmount = voucherProduct.costAmount
        const putawayMovement: PutawayMovement = {
          voucherProductId,
          voucherBatchId,
          batchId,
          productId,
          warehouseId,
          putawayQuantity,
          putawayCostAmount: pcAmount,
          openQuantityProduct: productCalc.openQuantity,
          closeQuantityProduct: productCalc.openQuantity + 0,
          openQuantityBatch: 0,
          closeQuantityBatch: 0,
          openCostAmountBatch: 0,
          closeCostAmountBatch: 0,
        }
        putawayMovementList.push(putawayMovement)

        productCalc.openQuantity = putawayMovement.closeQuantityProduct
        return
      }

      // Tính toán xem cộng bao nhiêu số lượng trong khoảng âm và bao nhiêu trong khoảng dương
      const expectedQuantity = batchCalc.openQuantity + voucherProduct.quantity
      let putawayQuantityPositive = Math.min(expectedQuantity, voucherProduct.quantity)
      if (putawayQuantityPositive < 0) putawayQuantityPositive = 0
      const putawayQuantityNegative = voucherProduct.quantity - putawayQuantityPositive

      if (putawayQuantityNegative > 0) {
        const putawayQuantity = putawayQuantityNegative
        const putawayCostAmount = Math.round(
          (batchCalc.openCostAmount * putawayQuantity) / batchCalc.openQuantity
        )
        const putawayMovement: PutawayMovement = {
          voucherProductId,
          voucherBatchId,
          productId,
          batchId,
          warehouseId,
          putawayQuantity,
          putawayCostAmount,
          openQuantityProduct: productCalc.openQuantity,
          closeQuantityProduct: productCalc.openQuantity + putawayQuantity,
          openQuantityBatch: batchCalc.openQuantity,
          closeQuantityBatch: batchCalc.openQuantity + putawayQuantity,
          openCostAmountBatch: batchCalc.openCostAmount,
          closeCostAmountBatch: batchCalc.openCostAmount + putawayCostAmount,
        }
        putawayMovementList.push(putawayMovement)

        productCalc.openQuantity = putawayMovement.closeQuantityProduct
        batchCalc.openQuantity = putawayMovement.closeQuantityBatch
        batchCalc.openCostAmount = putawayMovement.closeCostAmountBatch
      }

      if (putawayQuantityPositive > 0) {
        const putawayQuantity = putawayQuantityPositive
        const putawayCostAmount = Math.round(
          (voucherProduct.costAmount * putawayQuantityPositive) / voucherProduct.quantity
        )
        const putawayMovement: PutawayMovement = {
          voucherProductId,
          voucherBatchId,
          productId,
          batchId,
          warehouseId,
          putawayQuantity,
          putawayCostAmount,
          openQuantityProduct: productCalc.openQuantity,
          closeQuantityProduct: productCalc.openQuantity + putawayQuantity,
          openQuantityBatch: batchCalc.openQuantity,
          closeQuantityBatch: batchCalc.openQuantity + putawayQuantity,
          openCostAmountBatch: batchCalc.openCostAmount,
          closeCostAmountBatch: batchCalc.openCostAmount + putawayCostAmount,
        }
        putawayMovementList.push(putawayMovement)

        productCalc.openQuantity = putawayMovement.closeQuantityProduct
        batchCalc.openQuantity = putawayMovement.closeQuantityBatch
        batchCalc.openCostAmount = putawayMovement.closeCostAmountBatch
      }
    })

    const putawayProductMap: Record<string, PutawayProduct> = {}
    const putawayBatchMap: Record<string, PutawayBatch> = {}
    const putawayVoucherProductMap: Record<string, PutawayVoucherProduct> = {}
    const putawayVoucherBatchMap: Record<string, PutawayVoucherBatch> = {}

    putawayMovementList.forEach((mov) => {
      const { productId, batchId, voucherProductId, voucherBatchId } = mov

      putawayProductMap[productId] ||= {
        productId,
        putawayQuantity: 0,
        openQuantity: productOriginMap[productId].quantity,
        closeQuantity: 0,
      }
      putawayProductMap[productId].putawayQuantity += mov.putawayQuantity
      putawayProductMap[productId].closeQuantity = mov.closeQuantityProduct

      // batch không ghi nhận số lượng ghi không
      if (batchId != 0) {
        putawayBatchMap[batchId] ||= {
          productId,
          batchId,
          putawayQuantity: 0,
          putawayCostAmount: 0,
          openQuantity: batchOriginMap[batchId].quantity,
          closeQuantity: 0,
          openCostAmount: batchOriginMap[batchId].costAmount,
          closeCostAmount: 0,
        }
        putawayBatchMap[batchId].putawayQuantity += mov.putawayQuantity
        putawayBatchMap[batchId].putawayCostAmount += mov.putawayCostAmount
        putawayBatchMap[batchId].closeQuantity = mov.closeQuantityBatch
        putawayBatchMap[batchId].closeCostAmount = mov.closeQuantityBatch
      }

      putawayVoucherProductMap[voucherProductId] ||= {
        voucherProductId,
        productId,
        putawayQuantity: 0,
        putawayCostAmount: 0,
      }
      putawayVoucherProductMap[voucherProductId].putawayQuantity += mov.putawayQuantity
      putawayVoucherProductMap[voucherProductId].putawayCostAmount += mov.putawayCostAmount

      const keyVoucherBatch = `${voucherProductId}-${voucherBatchId}-${batchId}`
      putawayVoucherBatchMap[keyVoucherBatch] ||= {
        voucherBatchId,
        voucherProductId,
        productId,
        batchId,
        putawayQuantity: 0,
        putawayCostAmount: 0,
      }
      putawayVoucherBatchMap[keyVoucherBatch].putawayQuantity += mov.putawayQuantity
      putawayVoucherBatchMap[keyVoucherBatch].putawayCostAmount += mov.putawayCostAmount
    })

    const putawayPlan = {
      putawayMovementList,
      putawayProductList: Object.values(putawayProductMap),
      putawayBatchList: Object.values(putawayBatchMap),
      putawayVoucherProductList: Object.values(putawayVoucherProductMap),
      putawayVoucherBatchList: Object.values(putawayVoucherBatchMap),
    }

    return putawayPlan
  }
}
