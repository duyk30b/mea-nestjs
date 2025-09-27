import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { ESTimer } from '../../../common/helpers/time.helper'
import { BusinessError } from '../../common/error'
import { PickupStrategy } from '../../common/variable'
import { Batch, Product } from '../../entities'

export type PickupMovement = {
  voucherProductId: string
  productId: number
  batchId: number
  pickupStrategy: PickupStrategy
  pickupQuantity: number
  pickupCostAmount: number
  openQuantityProduct: number
  closeQuantityProduct: number
  openQuantityBatch: number
  closeQuantityBatch: number
  openCostAmountBatch: number
  closeCostAmountBatch: number
}

export type PickupProduct = {
  productId: number
  pickupQuantity: number
  openQuantity: number
  closeQuantity: number
}

export type PickupBatch = {
  batchId: number
  productId: number
  pickupQuantity: number
  pickupCostAmount: number
  openQuantity: number
  closeQuantity: number
  openCostAmount: number
  closeCostAmount: number
}

export type PickupVoucherProduct = {
  voucherProductId: string
  pickupStrategy: PickupStrategy
  productId: number
  pickupQuantity: number
  pickupCostAmount: number
}

export type PickupVoucherBatch = {
  voucherProductId: string
  batchId: number
  productId: number
  pickupQuantity: number
  pickupCostAmount: number
}

@Injectable()
export class ProductPickupPlan {
  constructor(private dataSource: DataSource) { }

  // Nhặt hàng thì lưu ý những trường hợp sau
  // 1. Nhặt có thể chưa có batchId, cần chọn chiến thuật nhặt hàng
  // 2. Nhặt hàng có thể dùng costAmount trong trường hợp trả hàng, còn nếu nhặt thông thường lại phải tự tính costAmount
  // 3. Nhặt hàng số lượng âm thì luôn luôn lấy costAmount âm bất kể tình huống
  // Như vậy cần làm
  // 1. Luôn dùng voucherProductList vì nó đã có kèm theo batchId
  // 2. Sau khi có voucherBatchList rồi thì khi đó tính costAmount
  generatePickupPlan(data: {
    productOriginList: Product[]
    batchOriginList: Batch[]
    voucherProductList: {
      voucherProductId: string
      warehouseIds: string // tự động chọn kho cũng cần tìm chính xác chọn ở kho nào nữa (dạng "[0,1]")
      productId: number
      batchId: number
      costAmount: number | null // nếu truyền null thì tự nhặt costAmount, nếu không thì cần lấy theo costAMount này
      quantity: number
      pickupStrategy: PickupStrategy
    }[]
    allowNegativeQuantity: boolean
  }) {
    const { productOriginList, batchOriginList, voucherProductList, allowNegativeQuantity } = data

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

    const pickupMovementList: PickupMovement[] = []
    voucherProductList.forEach((voucherProduct) => {
      const { voucherProductId, productId, pickupStrategy } = voucherProduct
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
        const pickupQuantity = voucherProduct.quantity
        const pickupCostAmount = voucherProduct.quantity * productOrigin.costPrice
        const pickupMovement: PickupMovement = {
          voucherProductId,
          productId,
          batchId: 0, // không chỉ định lô bị trừ
          pickupStrategy: voucherProduct.pickupStrategy,
          pickupQuantity,
          pickupCostAmount, // chiến lược không quản lý kho thì vốn tính tương đối theo sản phẩm
          openQuantityProduct: productCalc.openQuantity,
          closeQuantityProduct: productCalc.openQuantity - 0,
          openQuantityBatch: 0,
          closeQuantityBatch: 0,
          openCostAmountBatch: 0,
          closeCostAmountBatch: 0,
        }
        pickupMovementList.push(pickupMovement)
      }

      // nếu chiến lược là chọn lô thì batchId phải khác 0 // voucherProduct.pickupStrategy === PickupStrategy.RequireBatchSelection
      else if (voucherProduct.batchId !== 0) {
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
            ` Lô hàng ${batchCalc.batch.lotNumber} ${expiryDateString}:`,
            ` còn ${batchCalc.openQuantity}, lấy ${voucherProduct.quantity}`
          )
        }

        // Nhặt từ dương đến âm, công thức dưới sẽ bao gồm cả trường hợp nó âm sẵn từ đầu
        let pickupQuantityPositive = Math.min(batchCalc.openQuantity, voucherProduct.quantity)
        if (pickupQuantityPositive < 0) pickupQuantityPositive = 0
        const pickupQuantityNegative = voucherProduct.quantity - pickupQuantityPositive

        if (pickupQuantityPositive > 0) {
          const pickupQuantity = pickupQuantityPositive
          let pickupCostAmount = 0
          if (voucherProduct.costAmount == null) {
            // trường hợp này thì batchCalc.openQuantity > 0 sẵn nên cứ thế mà tính thôi
            // trường hợp này thì đương nhiên pickupCostAmount > batchCalc.openQuantity, nên khỏi lo
            pickupCostAmount = Math.round(
              (batchCalc.openCostAmount * pickupQuantity) / batchCalc.openQuantity
            )
          } else {
            // ?????????? trường hợp này thì có chọn sẵn costAmount, nên có thể gây ra sai sót nhiều
            pickupCostAmount = Math.round(
              (voucherProduct.costAmount * pickupQuantity) / voucherProduct.quantity
            )
            if (pickupCostAmount > batchCalc.openCostAmount) {
              pickupCostAmount = batchCalc.openCostAmount // khống chế không cho trừ thành số lượng âm (chỗ này sẽ gây sai lệch logic)
            }
          }
          const pickupMovement: PickupMovement = {
            voucherProductId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickupStrategy: voucherProduct.pickupStrategy,
            pickupQuantity,
            pickupCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickupQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickupQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickupCostAmount,
          }
          pickupMovementList.push(pickupMovement)

          productCalc.openQuantity = pickupMovement.closeQuantityProduct
          batchCalc.openQuantity = pickupMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickupMovement.closeCostAmountBatch
        }
        if (pickupQuantityNegative > 0) {
          const pickupQuantity = pickupQuantityNegative
          // nếu số lượng âm thì chỉ được phép tính theo costAmount của sản phẩm
          let pickupCostAmount = 0
          if (batchCalc.openQuantity === 0) {
            pickupCostAmount = productOrigin.costPrice * pickupQuantity
          } else {
            pickupCostAmount = Math.round(
              (batchCalc.openCostAmount * pickupQuantity) / batchCalc.openQuantity
            )
          }

          const pickupMovement: PickupMovement = {
            voucherProductId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickupStrategy: voucherProduct.pickupStrategy,
            pickupQuantity,
            pickupCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickupQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickupQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickupCostAmount,
          }
          pickupMovementList.push(pickupMovement)

          productCalc.openQuantity = pickupMovement.closeQuantityProduct
          batchCalc.openQuantity = pickupMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickupMovement.closeCostAmountBatch
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
          const pickupQuantity = Math.min(quantityCalculator, batchCalc.openQuantity)
          if (pickupQuantity <= 0) continue

          // Trường hợp này thì quantity và costAmount luôn > 0, nên mọi thứ nghe vẻ dễ dàng hơn
          const pickupCostAmount = Math.round(
            (batchCalc.openCostAmount * pickupQuantity) / batchCalc.openQuantity
          )
          const pickupMovement: PickupMovement = {
            voucherProductId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickupStrategy: voucherProduct.pickupStrategy,
            pickupQuantity,
            pickupCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickupQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickupQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickupCostAmount,
          }
          pickupMovementList.push(pickupMovement)

          productCalc.openQuantity = pickupMovement.closeQuantityProduct
          batchCalc.openQuantity = pickupMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickupMovement.closeCostAmountBatch

          quantityCalculator -= pickupQuantity
        }

        // nếu không lấy đủ thì phải lấy và nhặt vào lô cuối cùng và sẽ để nó bị âm
        if (quantityCalculator > 0) {
          if (!allowNegativeQuantity) {
            throw new BusinessError(`${productOrigin.brandName} không đủ số lượng trong kho`)
          }
          // nhặt vào lô cuối cùng, logic nhặt tương tự như chiến lượng chọn lô
          const batchCalc = batchCalcList[batchCalcList.length - 1]
          const pickupQuantity = quantityCalculator
          let pickupCostAmount = 0
          if (batchCalc.openQuantity === 0) {
            pickupCostAmount = pickupQuantity * productOrigin.costPrice
          } else {
            pickupCostAmount = Math.round(
              (batchCalc.openCostAmount * pickupQuantity) / batchCalc.openQuantity
            )
          }

          // với số âm thì costAmount luôn nhặt theo sản phẩm
          const pickupMovement: PickupMovement = {
            voucherProductId,
            productId,
            batchId: batchCalc.batch.id, // không chỉ định lô bị trừ
            pickupStrategy: voucherProduct.pickupStrategy,
            pickupQuantity,
            pickupCostAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity - pickupQuantity,
            openQuantityBatch: batchCalc.openQuantity,
            closeQuantityBatch: batchCalc.openQuantity - pickupQuantity,
            openCostAmountBatch: batchCalc.openCostAmount,
            closeCostAmountBatch: batchCalc.openCostAmount - pickupCostAmount,
          }
          pickupMovementList.push(pickupMovement)

          productCalc.openQuantity = pickupMovement.closeQuantityProduct
          batchCalc.openQuantity = pickupMovement.closeQuantityBatch
          batchCalc.openCostAmount = pickupMovement.closeCostAmountBatch
        }
      }
    })

    const pickupProductMap: Record<string, PickupProduct> = {}
    const pickupBatchMap: Record<string, PickupBatch> = {}
    const pickupVoucherProductMap: Record<string, PickupVoucherProduct> = {}
    const pickupVoucherBatchMap: Record<string, PickupVoucherBatch> = {}

    pickupMovementList.forEach((mov) => {
      const { productId, batchId, voucherProductId } = mov
      pickupProductMap[productId] ||= {
        productId,
        pickupQuantity: 0,
        openQuantity: productOriginMap[productId].quantity,
        closeQuantity: 0,
      }
      pickupProductMap[productId].pickupQuantity += mov.pickupQuantity
      pickupProductMap[productId].closeQuantity = mov.closeQuantityProduct

      if (batchId != 0) {
        // batch không ghi nhận số lượng với batchId = 0 được
        pickupBatchMap[batchId] ||= {
          productId,
          batchId,
          pickupQuantity: 0,
          pickupCostAmount: 0,
          openQuantity: batchOriginMap[batchId].quantity,
          closeQuantity: 0,
          openCostAmount: batchOriginMap[batchId].costAmount,
          closeCostAmount: 0,
        }
        pickupBatchMap[batchId].pickupQuantity += mov.pickupQuantity
        pickupBatchMap[batchId].pickupCostAmount += mov.pickupCostAmount
        pickupBatchMap[batchId].closeQuantity = mov.closeQuantityBatch
        pickupBatchMap[batchId].closeCostAmount = mov.closeQuantityBatch
      }

      pickupVoucherProductMap[voucherProductId] ||= {
        pickupStrategy: mov.pickupStrategy,
        voucherProductId,
        productId,
        pickupQuantity: 0,
        pickupCostAmount: 0,
      }
      pickupVoucherProductMap[voucherProductId].pickupQuantity += mov.pickupQuantity
      pickupVoucherProductMap[voucherProductId].pickupCostAmount += mov.pickupCostAmount

      const keyVoucherBatch = `${voucherProductId}-${batchId}`
      pickupVoucherBatchMap[keyVoucherBatch] ||= {
        voucherProductId,
        productId,
        batchId,
        pickupCostAmount: 0,
        pickupQuantity: 0,
      }

      pickupVoucherBatchMap[keyVoucherBatch].pickupQuantity += mov.pickupQuantity
      pickupVoucherBatchMap[keyVoucherBatch].pickupCostAmount += mov.pickupCostAmount
    })

    const pickupPlan = {
      pickupMovementList,
      pickupProductList: Object.values(pickupProductMap),
      pickupBatchList: Object.values(pickupBatchMap),
      pickupVoucherProductList: Object.values(pickupVoucherProductMap),
      pickupVoucherBatchList: Object.values(pickupVoucherBatchMap),
    }

    return pickupPlan
  }
}
