import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Distributor, Product } from '../../../../_libs/database/entities'
import { DistributorPaymentRepository } from '../../../../_libs/database/repository/distributor-payment/distributor-payment.repository'
import { ReceiptCancel } from '../../../../_libs/database/repository/receipt/receipt-cancel'
import { ReceiptDraft } from '../../../../_libs/database/repository/receipt/receipt-draft'
import { ReceiptPayDebt } from '../../../../_libs/database/repository/receipt/receipt-pay-debt'
import { ReceiptPrepayment } from '../../../../_libs/database/repository/receipt/receipt-prepayment'
import { ReceiptRefundPrepayment } from '../../../../_libs/database/repository/receipt/receipt-refund-prepayment'
import { ReceiptSendProductAndPayment } from '../../../../_libs/database/repository/receipt/receipt-send-product-and-payment'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  ReceiptDraftInsertBody,
  ReceiptGetManyQuery,
  ReceiptGetOneQuery,
  ReceiptPaginationQuery,
  ReceiptUpdateBody,
} from './request'

@Injectable()
export class ApiReceiptService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptDraft: ReceiptDraft,
    private readonly receiptPrepayment: ReceiptPrepayment,
    private readonly receiptRefundPrepayment: ReceiptRefundPrepayment,
    private readonly receiptSendProductAndPayment: ReceiptSendProductAndPayment,
    private readonly receiptPayDebt: ReceiptPayDebt,
    private readonly receiptCancel: ReceiptCancel,
    private readonly distributorPaymentRepository: DistributorPaymentRepository
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
        receiptItems: relation?.receiptItems,
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
        distributorPayments: !!relation?.distributorPayments,
        receiptItems: relation?.receiptItems,
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
        distributorPayments: !!relation?.distributorPayments,
        receiptItems: relation?.receiptItems,
      }
    )
    return { data: receipt }
  }

  async createDraft(params: { oid: number; body: ReceiptDraftInsertBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { receiptId } = await this.receiptDraft.createDraft({
        oid,
        receiptInsertDto: body.receipt,
        receiptItemListDto: body.receiptItemList,
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraftPrepayment(params: {
    oid: number
    receiptId: number
    body: ReceiptUpdateBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params
    try {
      await this.receiptDraft.updateDraftPrepayment({
        oid,
        receiptId,
        receiptUpdateDto: body.receipt,
        receiptItemListDto: body.receiptItemList,
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
      const { receiptBasic } = await this.receiptPrepayment.prepayment({
        oid,
        receiptId,
        time: Date.now(),
        money,
      })
      const distributorPayments = await this.distributorPaymentRepository.findMany({
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
          distributorPayments,
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
      const { receiptBasic } = await this.receiptRefundPrepayment.refundPrepayment({
        oid,
        receiptId,
        time: Date.now(),
        money,
      })
      const distributorPayments = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      return { data: { receiptBasic, distributorPayments } }
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
      const result = await this.receiptSendProductAndPayment.sendProductAndPayment({
        oid,
        receiptId,
        time,
        money,
      })
      const distributorPayments = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: result.receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterChangeProductAndDistributor(oid, result)
      return {
        data: {
          receiptBasic: result.receiptBasic,
          distributorPayments,
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
      const { distributor, receiptBasic } = await this.receiptPayDebt.payDebt({
        oid,
        receiptId,
        time,
        money,
      })
      const distributorPayments = await this.distributorPaymentRepository.findMany({
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
          distributorPayments,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async cancel(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time, money } = params
    try {
      const result = await this.receiptCancel.cancel({ oid, receiptId, time, money })
      const distributorPaymentList = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: result.receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterChangeProductAndDistributor(oid, result)
      return {
        data: {
          receiptBasic: result.receiptBasic,
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
