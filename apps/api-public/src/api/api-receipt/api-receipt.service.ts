import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyArray, uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Distributor, Product } from '../../../../_libs/database/entities'
import { BatchInsertType } from '../../../../_libs/database/entities/batch.entity'
import {
  ReceiptCancelOperation,
  ReceiptDraftOperation,
  ReceiptPayDebtOperation,
  ReceiptPrepaymentOperation,
  ReceiptRefundPrepaymentOperation,
  ReceiptSendProductAndPaymentOperation,
} from '../../../../_libs/database/operations'
import { BatchRepository } from '../../../../_libs/database/repositories/batch.repository'
import { DistributorPaymentRepository } from '../../../../_libs/database/repositories/distributor-payment.repository'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  ReceiptGetManyQuery,
  ReceiptGetOneQuery,
  ReceiptPaginationQuery,
  ReceiptUpsertBody,
} from './request'

@Injectable()
export class ApiReceiptService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptDraft: ReceiptDraftOperation,
    private readonly receiptPrepaymentOperation: ReceiptPrepaymentOperation,
    private readonly receiptRefundPrepaymentOperation: ReceiptRefundPrepaymentOperation,
    private readonly receiptPayDebtOperation: ReceiptPayDebtOperation,
    private readonly distributorPaymentRepository: DistributorPaymentRepository,
    private readonly batchRepository: BatchRepository,
    private readonly receiptSendProductAndPaymentOperation: ReceiptSendProductAndPaymentOperation,
    private readonly receiptCancelOperation: ReceiptCancelOperation
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

  async getOne(oid: number, id: number, { relation }: ReceiptGetOneQuery): Promise<BaseResponse> {
    const receipt = await this.receiptRepository.findOne({
      condition: { oid, id },
      relation: {
        distributor: !!relation?.distributor,
        distributorPaymentList: !!relation?.distributorPaymentList,
        receiptItemList: relation?.receiptItemList,
      },
    })
    if (!receipt) {
      throw new BusinessException('error.Database.NotFound')
    }
    return { data: { receipt } }
  }

  async queryOne(oid: number, id: number, { relation }: ReceiptGetOneQuery): Promise<BaseResponse> {
    const receipt = await this.receiptRepository.queryOneBy(
      { oid, id },
      {
        distributor: !!relation?.distributor,
        distributorPaymentList: !!relation?.distributorPaymentList,
        receiptItemList: relation?.receiptItemList,
      }
    )
    return { data: receipt }
  }

  async createDraft(params: { oid: number; body: ReceiptUpsertBody }): Promise<BaseResponse> {
    const { oid, body } = params
    // tự động chọn lô
    const { receipt, receiptItemList, distributorId } = body
    const productIdList = receiptItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const batchList = await this.batchRepository.findManyBy({
      oid,
      productId: { IN: uniqueArray(productIdList) },
    })
    const batchListMap = arrayToKeyArray(batchList, 'productId')

    receiptItemList.forEach((receiptItem) => {
      if (receiptItem.batchId) return
      const batchFind = (batchListMap[receiptItem.productId] || []).find((batch) => {
        if (batch.distributorId != distributorId) return false
        if (batch.warehouseId != receiptItem.warehouseId) return false
        if (batch.lotNumber != receiptItem.lotNumber) return false
        if (batch.expiryDate != receiptItem.expiryDate) return false
        if (batch.costPrice != receiptItem.costPrice) return false
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
        lotNumber: receiptItem.lotNumber,
        expiryDate: receiptItem.expiryDate,
        costPrice: receiptItem.costPrice,
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    receiptItemListNoBatch.forEach((receiptItem, index) => {
      receiptItem.batchId = batchIdInsertList[index]
    })

    try {
      const { receiptId } = await this.receiptDraft.createDraft({
        oid,
        receiptInsertDto: { ...receipt, distributorId },
        receiptItemListDto: receiptItemList,
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraftPrepayment(params: {
    oid: number
    receiptId: number
    body: ReceiptUpsertBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params

    // tự động chọn lô
    const { receipt, receiptItemList, distributorId } = body
    const productIdList = receiptItemList.filter((i) => !i.batchId).map((i) => i.productId)
    const batchList = await this.batchRepository.findManyBy({
      oid,
      productId: { IN: uniqueArray(productIdList) },
    })
    const batchListMap = arrayToKeyArray(batchList, 'productId')

    receiptItemList.forEach((receiptItem) => {
      if (receiptItem.batchId) return
      const batchFind = (batchListMap[receiptItem.productId] || []).find((batch) => {
        if (batch.warehouseId != receiptItem.warehouseId) return false
        if (batch.lotNumber != receiptItem.lotNumber) return false
        if (batch.expiryDate != receiptItem.expiryDate) return false
        if (batch.costPrice != receiptItem.costPrice) return false
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
        lotNumber: receiptItem.lotNumber,
        expiryDate: receiptItem.expiryDate,
        costPrice: receiptItem.costPrice,
      }
      return batchInsert
    })
    const batchIdInsertList = await this.batchRepository.insertMany(batchInsertList)
    receiptItemListNoBatch.forEach((receiptItem, index) => {
      receiptItem.batchId = batchIdInsertList[index]
    })

    try {
      await this.receiptDraft.updateDraftPrepayment({
        oid,
        receiptId,
        receiptUpdateDto: receipt,
        receiptItemListDto: receiptItemList,
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(params: {
    oid: number
    receiptId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, money } = params
    try {
      const { receiptBasic } = await this.receiptPrepaymentOperation.prepayment({
        oid,
        receiptId,
        time: Date.now(),
        money,
      })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      return {
        data: {
          receiptBasic,
          distributorPaymentList,
        },
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundPrepayment(params: {
    oid: number
    receiptId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, money } = params
    try {
      const { receiptBasic } = await this.receiptRefundPrepaymentOperation.refundPrepayment({
        oid,
        receiptId,
        time: Date.now(),
        money,
      })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      return { data: { receiptBasic, distributorPaymentList } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProductAndPayment(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time, money } = params
    try {
      const result = await this.receiptSendProductAndPaymentOperation.start({
        oid,
        receiptId,
        time,
        money,
      })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: result.receipt.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterChangeProductAndDistributor(oid, result)
      return {
        data: {
          receipt: result.receipt,
          distributorPaymentList,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time, money } = params
    try {
      const { distributor, receiptBasic } = await this.receiptPayDebtOperation.payDebt({
        oid,
        receiptId,
        time,
        money,
      })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      if (distributor) {
        this.socketEmitService.distributorUpsert(oid, { distributor })
      }
      return {
        data: {
          receiptBasic,
          distributorPaymentList,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async cancel(params: { oid: number; receiptId: number; time: number }): Promise<BaseResponse> {
    const { oid, receiptId, time } = params
    try {
      const result = await this.receiptCancelOperation.start({ oid, receiptId, time })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: result.receipt.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterChangeProductAndDistributor(oid, result)
      return {
        data: {
          receipt: result.receipt,
          distributorPaymentList,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroy(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    try {
      await this.receiptRepository.destroy({ oid, receiptId })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async emitSocketAfterChangeProductAndDistributor(
    oid: number,
    data: { distributor: Distributor; productList: Product[]; batchList: Batch[] }
  ) {
    const { distributor, productList, batchList } = data
    if (distributor) {
      this.socketEmitService.distributorUpsert(oid, { distributor })
    }
    if (productList.length) {
      this.socketEmitService.productListUpdate(oid, { productList })
    }
    if (batchList.length) {
      this.socketEmitService.batchListUpdate(oid, { batchList })
    }
  }
}
