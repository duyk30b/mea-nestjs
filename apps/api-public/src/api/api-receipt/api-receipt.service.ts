import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import {
    ESArray,
} from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Product } from '../../../../_libs/database/entities'
import { BatchInsertType } from '../../../../_libs/database/entities/batch.entity'
import { VoucherType } from '../../../../_libs/database/entities/payment.entity'
import {
    SplitBatchByCostPrice,
    SplitBatchByDistributor,
    SplitBatchByExpiryDate,
    SplitBatchByWarehouse,
} from '../../../../_libs/database/entities/product.entity'
import {
    ReceiptDepositedOperation,
    ReceiptDraftOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository, ProductRepository } from '../../../../_libs/database/repositories'
import { BatchRepository } from '../../../../_libs/database/repositories/batch.repository'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import {
    ReceiptGetManyQuery,
    ReceiptGetOneQuery,
    ReceiptPaginationQuery,
    ReceiptUpdateDepositedBody,
    ReceiptUpsertDraftBody,
} from './request'

@Injectable()
export class ApiReceiptService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository,
    private readonly receiptDraft: ReceiptDraftOperation,
    private readonly receiptDepositedOperation: ReceiptDepositedOperation,
    private readonly paymentRepository: PaymentRepository
  ) { }

  async pagination(oid: number, query: ReceiptPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { startedAt, distributorId, status } = query.filter || {}

    const { total, data } = await this.receiptRepository.pagination({
      page: query.page,
      limit: query.limit,
      condition: {
        oid,
        distributorId,
        status,
        startedAt,
      },
      relation: {
        distributor: relation?.distributor,
        receiptItemList: relation?.receiptItemList,
      },
      sort: query.sort || { id: 'DESC' },
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: ReceiptGetManyQuery): Promise<BaseResponse> {
    const { relation, limit } = query
    const { startedAt, distributorId, status } = query.filter || {}

    const receiptList = await this.receiptRepository.findMany({
      condition: {
        oid,
        distributorId,
        status,
        startedAt,
      },
      limit,
      relation: { distributor: relation?.distributor },
    })
    return { data: receiptList }
  }

  async getOne(
    oid: number,
    receiptId: number,
    { relation }: ReceiptGetOneQuery
  ): Promise<BaseResponse> {
    const receipt = await this.receiptRepository.findOne({
      condition: { oid, id: receiptId },
      relation: {
        distributor: !!relation?.distributor,
        receiptItemList: relation?.receiptItemList,
      },
      relationLoadStrategy: 'query',
    })
    if (!receipt) {
      throw new BusinessException('error.Database.NotFound')
    }
    if (relation.paymentList) {
      receipt.paymentList = await this.paymentRepository.findMany({
        condition: { oid, voucherId: receiptId, voucherType: VoucherType.Receipt },
        sort: { id: 'ASC' },
      })
    }
    return { data: { receipt } }
  }

  async queryOne(
    oid: number,
    receiptId: number,
    { relation }: ReceiptGetOneQuery
  ): Promise<BaseResponse> {
    const receipt = await this.receiptRepository.queryOneBy(
      { oid, id: receiptId },
      {
        distributor: !!relation?.distributor,
        receiptItemList: relation?.receiptItemList,
      }
    )
    return { data: receipt }
  }

  async createDraft(params: { oid: number; body: ReceiptUpsertDraftBody }): Promise<BaseResponse> {
    const { oid, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    const { receipt: receiptBody, receiptItemList, distributorId } = body
    const productIdList = receiptItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique } }),
      this.batchRepository.findManyBy({ oid, productId: { IN: productIdUnique } }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    receiptItemList.forEach((receiptItem, index) => {
      if (receiptItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[receiptItem.productId] || []).find((batch) => {
        const product = productMap[receiptItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != receiptItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != receiptItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != receiptItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        receiptItem.batchId = batchFind.id
      }
    })

    const receiptItemListNoBatch = receiptItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = receiptItemListNoBatch.map((receiptItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: receiptItem.productId,
        warehouseId: receiptItem.warehouseId,
        batchCode: receiptItem.batchCode,
        expiryDate: receiptItem.expiryDate,
        costPrice: receiptItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    receiptItemListNoBatch.forEach((receiptItem, index) => {
      receiptItem.batchId = batchIdInsertList[index]
    })

    try {
      const { receipt } = await this.receiptDraft.createDraft({
        oid,
        receiptInsertDto: { ...receiptBody, distributorId },
        receiptItemListDto: receiptItemList,
      })
      return { data: { receiptId: receipt.id } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraft(params: {
    oid: number
    receiptId: number
    body: ReceiptUpsertDraftBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    // tự động chọn lô
    const { receipt: receiptBody, receiptItemList, distributorId } = body
    const productIdList = receiptItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique } }),
      this.batchRepository.findManyBy({ oid, productId: { IN: productIdUnique } }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    receiptItemList.forEach((receiptItem, index) => {
      if (receiptItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[receiptItem.productId] || []).find((batch) => {
        const product = productMap[receiptItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != receiptItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != receiptItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != receiptItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        receiptItem.batchId = batchFind.id
      }
    })

    const receiptItemListNoBatch = receiptItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = receiptItemListNoBatch.map((receiptItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: receiptItem.productId,
        warehouseId: receiptItem.warehouseId,
        batchCode: receiptItem.batchCode,
        expiryDate: receiptItem.expiryDate,
        costPrice: receiptItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    receiptItemListNoBatch.forEach((receiptItem, index) => {
      receiptItem.batchId = batchIdInsertList[index]
    })

    try {
      await this.receiptDraft.updateDraft({
        oid,
        receiptId,
        receiptUpdateDto: { ...receiptBody, distributorId },
        receiptItemListDto: receiptItemList,
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async depositedUpdate(params: {
    oid: number
    receiptId: number
    body: ReceiptUpdateDepositedBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params
    const [settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])
    const productSettingCommon = settingMap.PRODUCT_SETTING || {}
    const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

    // tự động chọn lô
    const { receipt: receiptDto, receiptItemList, distributorId } = body
    const productIdList = receiptItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const productIdUnique = ESArray.uniqueArray(productIdList)
    const [productList, batchList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdUnique } }),
      this.batchRepository.findManyBy({ oid, productId: { IN: productIdUnique } }),
    ])
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    receiptItemList.forEach((receiptItem, index) => {
      if (receiptItem.batchId) return // chọn lô rồi thì thôi
      // Tự động chọn lô
      const batchFind = (batchListMap[receiptItem.productId] || []).find((batch) => {
        const product = productMap[receiptItem.productId]
        if (!product) {
          throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
        }
        const splitRule = Product.getProductSettingRule(
          product,
          productSettingCommon,
          productSettingRoot
        )
        if (batch.warehouseId != receiptItem.warehouseId) {
          if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
            return false
          }
        }
        if (batch.distributorId != distributorId) {
          if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
            return false
          }
        }
        if (batch.expiryDate != receiptItem.expiryDate) {
          if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
            return false
          }
        }
        if (batch.costPrice != receiptItem.costPrice) {
          if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
            return false
          }
        }
        return true
      })
      if (batchFind) {
        receiptItem.batchId = batchFind.id
      }
    })

    const receiptItemListNoBatch = receiptItemList.filter((i) => !i.batchId)
    const batchInsertList: BatchInsertType[] = receiptItemListNoBatch.map((receiptItem) => {
      const batchInsert: BatchInsertType = {
        oid,
        distributorId,
        productId: receiptItem.productId,
        warehouseId: receiptItem.warehouseId,
        batchCode: receiptItem.batchCode,
        expiryDate: receiptItem.expiryDate,
        costPrice: receiptItem.costPrice,
        quantity: 0,
        costAmount: 0,
        registeredAt: Date.now(),
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    receiptItemListNoBatch.forEach((receiptItem, index) => {
      receiptItem.batchId = batchIdInsertList[index]
    })

    try {
      await this.receiptDepositedOperation.update({
        oid,
        receiptId,
        receiptUpdateDto: receiptDto,
        receiptItemListDto: receiptItemList,
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
