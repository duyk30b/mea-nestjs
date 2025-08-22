import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../../_libs/common/helpers/array.helper'
import { Product } from '../../../../../_libs/database/entities'
import { BatchInsertType } from '../../../../../_libs/database/entities/batch.entity'
import {
  ProductType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../../_libs/database/entities/product.entity'
import {
  PurchaseOrderDepositedOperation,
  PurchaseOrderDraftOperation,
} from '../../../../../_libs/database/operations'
import {
  ProductRepository,
} from '../../../../../_libs/database/repositories'
import { BatchRepository } from '../../../../../_libs/database/repositories/batch.repository'
import {
  PurchaseOrderUpdateDepositedBody,
  PurchaseOrderUpsertDraftBody,
} from './request'

@Injectable()
export class ApiPurchaseOrderReceptionService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository,
    private readonly purchaseOrderDraft: PurchaseOrderDraftOperation,
    private readonly purchaseOrderDepositedOperation: PurchaseOrderDepositedOperation
  ) { }

  async createDraft(params: { oid: number; body: PurchaseOrderUpsertDraftBody }) {
    const { oid, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    const { purchaseOrder: purchaseOrderBody, purchaseOrderItemList, distributorId } = body
    const productIdList = purchaseOrderItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique }, isActive: 1 }),
      this.batchRepository.findMany({
        condition: { oid, productId: { IN: productIdUnique }, isActive: 1 },
        sort: { id: 'DESC' },
      }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    purchaseOrderItemList.forEach((purchaseOrderItem, index) => {
      if (purchaseOrderItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[purchaseOrderItem.productId] || []).find((batch) => {
        const product = productMap[purchaseOrderItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        if (product.productType === ProductType.Basic) {
          return true // nếu là loại sản phẩm thường thì đúng luôn, không cần chọn lô
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != purchaseOrderItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != purchaseOrderItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != purchaseOrderItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        purchaseOrderItem.batchId = batchFind.id
      }
    })

    const purchaseOrderItemListNoBatch = purchaseOrderItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = purchaseOrderItemListNoBatch.map((purchaseOrderItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: purchaseOrderItem.productId,
        warehouseId: purchaseOrderItem.warehouseId,
        lotNumber: purchaseOrderItem.lotNumber,
        expiryDate: purchaseOrderItem.expiryDate,
        costPrice: purchaseOrderItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
        isActive: 1,
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    purchaseOrderItemListNoBatch.forEach((purchaseOrderItem, index) => {
      purchaseOrderItem.batchId = batchIdInsertList[index]
    })

    try {
      const { purchaseOrder } = await this.purchaseOrderDraft.createDraft({
        oid,
        purchaseOrderInsertDto: { ...purchaseOrderBody, distributorId },
        purchaseOrderItemListDto: purchaseOrderItemList,
      })
      return { purchaseOrderId: purchaseOrder.id }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraft(params: {
    oid: number
    purchaseOrderId: number
    body: PurchaseOrderUpsertDraftBody
  }) {
    const { oid, purchaseOrderId, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    // tự động chọn lô
    const { purchaseOrder: purchaseOrderBody, purchaseOrderItemList, distributorId } = body
    const productIdList = purchaseOrderItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique }, isActive: 1 }),
      this.batchRepository.findMany({
        condition: { oid, productId: { IN: productIdUnique }, isActive: 1 },
        sort: { id: 'DESC' },
      }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    purchaseOrderItemList.forEach((purchaseOrderItem, index) => {
      if (purchaseOrderItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[purchaseOrderItem.productId] || []).find((batch) => {
        const product = productMap[purchaseOrderItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        if (product.productType === ProductType.Basic) {
          return true // nếu là loại sản phẩm thường thì đúng luôn, không cần chọn lô
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != purchaseOrderItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != purchaseOrderItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != purchaseOrderItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        purchaseOrderItem.batchId = batchFind.id
      }
    })

    const purchaseOrderItemListNoBatch = purchaseOrderItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = purchaseOrderItemListNoBatch.map((purchaseOrderItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: purchaseOrderItem.productId,
        warehouseId: purchaseOrderItem.warehouseId,
        lotNumber: purchaseOrderItem.lotNumber,
        expiryDate: purchaseOrderItem.expiryDate,
        costPrice: purchaseOrderItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
        isActive: 1,
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    purchaseOrderItemListNoBatch.forEach((purchaseOrderItem, index) => {
      purchaseOrderItem.batchId = batchIdInsertList[index]
    })

    try {
      await this.purchaseOrderDraft.updateDraft({
        oid,
        purchaseOrderId,
        purchaseOrderUpdateDto: { ...purchaseOrderBody, distributorId },
        purchaseOrderItemListDto: purchaseOrderItemList,
      })
      return { purchaseOrderId }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async depositedUpdate(params: {
    oid: number
    purchaseOrderId: number
    body: PurchaseOrderUpdateDepositedBody
  }) {
    const { oid, purchaseOrderId, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    // tự động chọn lô
    const { purchaseOrder: purchaseOrderDto, purchaseOrderItemList, distributorId } = body
    const productIdList = purchaseOrderItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique }, isActive: 1 }),
      this.batchRepository.findMany({
        condition: { oid, productId: { IN: productIdUnique }, isActive: 1 },
        sort: { id: 'DESC' },
      }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    purchaseOrderItemList.forEach((purchaseOrderItem, index) => {
      if (purchaseOrderItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[purchaseOrderItem.productId] || []).find((batch) => {
        const product = productMap[purchaseOrderItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        if (product.productType === ProductType.Basic) {
          return true // nếu là loại sản phẩm thường thì đúng luôn, không cần chọn lô
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != purchaseOrderItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != purchaseOrderItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != purchaseOrderItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        purchaseOrderItem.batchId = batchFind.id
      }
    })

    const purchaseOrderItemListNoBatch = purchaseOrderItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = purchaseOrderItemListNoBatch.map((purchaseOrderItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: purchaseOrderItem.productId,
        warehouseId: purchaseOrderItem.warehouseId,
        lotNumber: purchaseOrderItem.lotNumber,
        expiryDate: purchaseOrderItem.expiryDate,
        costPrice: purchaseOrderItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
        isActive: 1,
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    purchaseOrderItemListNoBatch.forEach((purchaseOrderItem, index) => {
      purchaseOrderItem.batchId = batchIdInsertList[index]
    })

    try {
      await this.purchaseOrderDepositedOperation.update({
        oid,
        purchaseOrderId,
        purchaseOrderUpdateDto: purchaseOrderDto,
        purchaseOrderItemListDto: purchaseOrderItemList,
      })
      return { purchaseOrderId }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
