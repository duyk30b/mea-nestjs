import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { ESTimer } from '../../../common/helpers/time.helper'
import { BusinessError } from '../../common/error'
import { PickupStrategy } from '../../common/variable'
import { Batch, Product } from '../../entities'

export type PickingMovement = {
  voucherProductId: number
  voucherBatchId: number
  productId: number
  batchId: number
  pickingQuantity: number
  pickingCostAmount: number
  openQuantityProduct: number
  closeQuantityProduct: number
  openQuantityBatch: number
  closeQuantityBatch: number
  openCostAmountBatch: number
  closeCostAmountBatch: number
}

export type PickingProduct = {
  productId: number
  pickingQuantity: number
  openQuantity: number
  closeQuantity: number
}

export type PickingBatch = {
  batchId: number
  productId: number
  pickingQuantity: number
  pickingCostAmount: number
  openQuantity: number
  closeQuantity: number
  openCostAmount: number
  closeCostAmount: number
}

export type PickingVoucherProduct = {
  voucherProductId: number
  productId: number
  pickingQuantity: number
  pickingCostAmount: number
}

export type PickingVoucherBatch = {
  voucherProductId: number
  batchId: number
  productId: number
  pickingQuantity: number
  pickingCostAmount: number
}

@Injectable()
export class ProductPickingOperation {
  constructor(private dataSource: DataSource) { }

  // Nhặt hàng thì lưu ý những trường hợp sau
  // 1. Nhặt có thể chưa có batchId, cần chọn chiến thuật nhặt hàng
  // 2. Nhặt hàng có thể dùng costAmount trong trường hợp trả hàng, còn nếu nhặt thông thường lại phải tự tính costAmount
  // 3. Nhặt hàng số lượng âm thì luôn luôn lấy costAmount âm bất kể tình huống
  // Như vậy cần làm
  // 1. Tạo voucherBatchList từ voucherBatchList
  // 2. Sau khi có voucherBatchList rồi thì khi đó tính costAmount
  generatePickingPlan(data: {
    productOriginList: Product[]
    batchOriginList: Batch[]
    voucherBatchList: {
      voucherProductId: number
      voucherBatchId: number
      warehouseIds: string // tự động chọn kho cũng cần tìm chính xác chọn ở kho nào nữa (dạng "[0,1]")
      productId: number
      batchId: number
      costAmount: number | null // nếu truyền null thì tự nhặt costAmount, nếu không thì cần lấy theo costAMount này
      quantity: number
      pickupStrategy: PickupStrategy
    }[]
    allowNegativeQuantity: boolean
  }) {
    const { productOriginList, batchOriginList, voucherBatchList, allowNegativeQuantity } = data

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

    // ===== Bước 1: tính ra voucherBatchList để tính ra batchId kèm quantity của từng voucherProductId =====
    // tạo map theo productId, list các Batch cùng số lượng theo id tăng dần ===
    const batchCalcListMap: Record<
      string,
      { productId: number; openQuantity: number; openCostAmount: number; batch: Batch }[]
    > = {}
    batchOriginList.forEach((b) => {
      batchCalcListMap[b.productId] ||= []
      batchCalcListMap[b.productId].push({
        productId: b.productId,
        openQuantity: b.quantity,
        openCostAmount: b.costAmount,
        batch: b,
      })
    })
    // mặc định chiến lược đang là FIFO
    Object.keys(batchCalcListMap).forEach((productId) => {
      batchCalcListMap[productId].sort((a, b) => (a.batch.id < b.batch.id ? -1 : 1))
    })

    const pickingMovementList: PickingMovement[] = []
    voucherBatchList.forEach((voucherProduct) => {
      const { voucherProductId, voucherBatchId, productId, pickupStrategy } = voucherProduct
      // nếu sản phẩm chưa có lô hoặc lựa chọn không trừ kho thì không trừ
      const productOrigin = productOriginMap[productId]
      if (!productOrigin) {
        throw new BusinessError(`Không tìm thấy Product với productId=${productId}`)
      }
      const productCalc = productCalcMap[productId]
      if (
        !batchCalcListMap[productId]
        || !batchCalcListMap[productId].length
        || pickupStrategy === PickupStrategy.NoImpact
      ) {
        const pickingQuantity = voucherProduct.quantity
        const pickingCostAmount = voucherProduct.quantity * productOrigin.costPrice
        const pickingMovement: PickingMovement = {
          voucherProductId,
          voucherBatchId,
          productId,
          batchId: 0, // không chỉ định lô bị trừ
          pickingQuantity,
          pickingCostAmount, // chiến lược không quản lý kho thì vốn tính tương đối theo sản phẩm
          openQuantityProduct: productCalc.openQuantity,
          closeQuantityProduct: productCalc.openQuantity - 0,
          openQuantityBatch: 0,
          closeQuantityBatch: 0,
          openCostAmountBatch: 0,
          closeCostAmountBatch: 0,
        }
        pickingMovementList.push(pickingMovement)
      }

      // nếu chiến lược là chọn lô thì batchId phải khác 0
      else if (
        voucherProduct.pickupStrategy === PickupStrategy.RequireBatchSelection
        && voucherProduct.batchId !== 0
      ) {
        // chiến lược này thì nhặt chính xác loại lô hàng đó
        const batchCalc = batchCalcListMap[productId]?.find((i) => {
          return i.batch.id === voucherProduct.batchId
        })
        if (!batchCalc || !batchCalc.batch) {
          throw new BusinessError(`${productOrigin.brandName} không có lô hàng phù hợp`)
        }
        if (!allowNegativeQuantity && voucherProduct.quantity > batchCalc.openQuantity) {
          const expiryDateString = ESTimer.timeToText(batchCalc.batch.expiryDate, 'DD/MM/YYYY', 7)
          throw new BusinessError(
            `${productOrigin.brandName} không đủ số lượng trong kho.`,
            ` Lô hàng ${batchCalc.batch.batchCode} ${expiryDateString}:`,
            ` còn ${batchCalc.openQuantity}, lấy ${voucherProduct.quantity}`
          )
        }

        // Nhặt từ dương đến âm, công thức dưới sẽ bao gồm cả trường hợp nó âm sẵn từ đầu
        let pickingQuantityPositive = Math.min(batchCalc.openQuantity, voucherProduct.quantity)
        if (pickingQuantityPositive < 0) pickingQuantityPositive = 0
        const pickingQuantityNegative = voucherProduct.quantity - pickingQuantityPositive

        if (pickingQuantityPositive > 0) {
          const pickingQuantity = pickingQuantityPositive
          let pickingCostAmount = 0
          if (voucherProduct.costAmount == null) {
            // trường hợp này thì batchCalc.openQuantity > 0 sẵn nên cứ thế mà tính thôi
            // trường hợp này thì đương nhiên pickingCostAmount > batchCalc.openQuantity, nên khỏi lo
            pickingCostAmount = Math.round(
              (batchCalc.openCostAmount * pickingQuantity) / batchCalc.openQuantity
            )
          } else {
            // ?????????? trường hợp này thì có chọn sẵn costAmount, nên có thể gây ra sai sót nhiều
            pickingCostAmount = Math.round(
              (voucherProduct.costAmount * pickingQuantity) / voucherProduct.quantity
            )
            if (pickingCostAmount > batchCalc.openCostAmount) {
              pickingCostAmount = batchCalc.openCostAmount // khống chế không cho trừ thành số lượng âm (chỗ này sẽ gây sai lệch logic)
            }
          }
          const pickingMovement: PickingMovement = {
            voucherProductId,
            voucherBatchId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickingQuantity,
            pickingCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickingQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickingQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickingCostAmount,
          }
          pickingMovementList.push(pickingMovement)

          productCalc.openQuantity = pickingMovement.closeQuantityProduct
          batchCalc.openQuantity = pickingMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickingMovement.closeCostAmountBatch
        }
        if (pickingQuantityNegative > 0) {
          const pickingQuantity = pickingQuantityNegative
          // nếu số lượng âm thì chỉ được phép tính theo costAmount của sản phẩm
          let pickingCostAmount = 0
          if (batchCalc.openQuantity === 0) {
            pickingCostAmount = productOrigin.costPrice * pickingQuantity
          } else {
            pickingCostAmount = Math.round(
              (batchCalc.openCostAmount * pickingQuantity) / batchCalc.openQuantity
            )
          }

          const pickingMovement: PickingMovement = {
            voucherProductId,
            voucherBatchId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickingQuantity,
            pickingCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickingQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickingQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickingCostAmount,
          }
          pickingMovementList.push(pickingMovement)

          productCalc.openQuantity = pickingMovement.closeQuantityProduct
          batchCalc.openQuantity = pickingMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickingMovement.closeCostAmountBatch
        }
      }

      // mặc định tạm thời chiến lược còn lại là FIFO
      else {
        let quantityCalculator = voucherProduct.quantity
        const batchCalcList = batchCalcListMap[productId].filter((i) => {
          let warehouseIdList = []
          try {
            warehouseIdList = JSON.parse(voucherProduct.warehouseIds)
          } catch (error) {
            warehouseIdList = []
          }
          if (!warehouseIdList.length || warehouseIdList.includes(0)) return true // không chọn kho thì lấy tất
          if (i.batch.warehouseId === 0) return true // để ở kho tự do cũng lấy
          if (warehouseIdList.includes(i.batch.warehouseId)) return true // lấy chính xác trong kho đó
          return false
        })
        if (!batchCalcList.length) {
          throw new BusinessError(`${productOrigin.brandName} không có danh sách tồn kho phù hợp`)
        }
        for (let i = 0; i < batchCalcList.length; i++) {
          if (quantityCalculator <= 0) break

          const batchCalc = batchCalcList[i]
          const pickingQuantity = Math.min(quantityCalculator, batchCalc.openQuantity)
          if (pickingQuantity <= 0) continue

          // Trường hợp này thì quantity và costAmount luôn > 0, nên mọi thứ nghe vẻ dễ dàng hơn
          const pickingCostAmount = Math.round(
            (batchCalc.openCostAmount * pickingQuantity) / batchCalc.openQuantity
          )
          const pickingMovement: PickingMovement = {
            voucherProductId,
            voucherBatchId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickingQuantity,
            pickingCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickingQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickingQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickingCostAmount,
          }
          pickingMovementList.push(pickingMovement)

          productCalc.openQuantity = pickingMovement.closeQuantityProduct
          batchCalc.openQuantity = pickingMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickingMovement.closeCostAmountBatch

          quantityCalculator -= pickingQuantity
        }

        // nếu không lấy đủ thì phải lấy và nhặt vào lô cuối cùng và sẽ để nó bị âm
        if (quantityCalculator > 0) {
          if (!allowNegativeQuantity) {
            throw new BusinessError(`${productOrigin.brandName} không đủ số lượng trong kho`)
          }
          // nhặt vào lô cuối cùng, logic nhặt tương tự như chiến lượng chọn lô
          const batchCalc = batchCalcList[batchCalcList.length - 1]
          const pickingQuantity = quantityCalculator
          let pickingCostAmount = 0
          if (batchCalc.openQuantity === 0) {
            pickingCostAmount = pickingQuantity * productOrigin.costPrice
          } else {
            pickingCostAmount = Math.round(
              (batchCalc.openCostAmount * pickingQuantity) / batchCalc.openQuantity
            )
          }

          // với số âm thì costAmount luôn nhặt theo sản phẩm
          const pickingMovement: PickingMovement = {
            voucherProductId,
            voucherBatchId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickingQuantity,
            pickingCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickingQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickingQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickingCostAmount,
          }
          pickingMovementList.push(pickingMovement)

          productCalc.openQuantity = pickingMovement.closeQuantityProduct
          batchCalc.openQuantity = pickingMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickingMovement.closeCostAmountBatch
        }
      }
    })

    const pickingProductMap: Record<string, PickingProduct> = {}
    const pickingBatchMap: Record<string, PickingBatch> = {}
    const pickingVoucherProductMap: Record<string, PickingVoucherProduct> = {}
    const pickingVoucherBatchMap: Record<string, PickingVoucherBatch> = {}

    pickingMovementList.forEach((mov) => {
      const { productId, batchId, voucherProductId, voucherBatchId } = mov
      pickingProductMap[productId] ||= {
        productId,
        pickingQuantity: 0,
        openQuantity: productOriginMap[productId].quantity,
        closeQuantity: 0,
      }
      pickingProductMap[productId].pickingQuantity += mov.pickingQuantity
      pickingProductMap[productId].closeQuantity = mov.closeQuantityProduct

      if (batchId != 0) {
        // batch không ghi nhận số lượng với batchId = 0 được
        pickingBatchMap[batchId] ||= {
          productId,
          batchId,
          pickingQuantity: 0,
          pickingCostAmount: 0,
          openQuantity: batchOriginMap[batchId].quantity,
          closeQuantity: 0,
          openCostAmount: batchOriginMap[batchId].costAmount,
          closeCostAmount: 0,
        }
        pickingBatchMap[batchId].pickingQuantity += mov.pickingQuantity
        pickingBatchMap[batchId].pickingCostAmount += mov.pickingCostAmount
        pickingBatchMap[batchId].closeQuantity = mov.closeQuantityBatch
        pickingBatchMap[batchId].closeCostAmount = mov.closeQuantityBatch
      }

      pickingVoucherProductMap[voucherProductId] ||= {
        voucherProductId,
        productId,
        pickingQuantity: 0,
        pickingCostAmount: 0,
      }
      pickingVoucherProductMap[voucherProductId].pickingQuantity += mov.pickingQuantity
      pickingVoucherProductMap[voucherProductId].pickingCostAmount += mov.pickingCostAmount

      const keyVoucherBatch = `${voucherProductId}-${voucherBatchId}-${batchId}`
      pickingVoucherBatchMap[keyVoucherBatch] ||= {
        voucherProductId,
        productId,
        batchId,
        pickingCostAmount: 0,
        pickingQuantity: 0,
      }

      pickingVoucherBatchMap[keyVoucherBatch].pickingQuantity += mov.pickingQuantity
      pickingVoucherBatchMap[keyVoucherBatch].pickingCostAmount += mov.pickingCostAmount
    })

    const pickingContainer = {
      pickingMovementList,
      pickingProductList: Object.values(pickingProductMap),
      pickingBatchList: Object.values(pickingBatchMap),
      pickingVoucherProductList: Object.values(pickingVoucherProductMap),
      pickingVoucherBatchList: Object.values(pickingVoucherBatchMap),
    }

    return pickingContainer
  }
}
