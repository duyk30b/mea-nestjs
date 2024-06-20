import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ReceiptStatus } from '../../../../_libs/database/common/variable'
import { Batch, Distributor, Product } from '../../../../_libs/database/entities'
import { DistributorPaymentRepository } from '../../../../_libs/database/repository/distributor-payment/distributor-payment.repository'
import { ReceiptDraft } from '../../../../_libs/database/repository/receipt/receipt-draft'
import { ReceiptPayDebt } from '../../../../_libs/database/repository/receipt/receipt-pay-debt'
import { ReceiptPrepayment } from '../../../../_libs/database/repository/receipt/receipt-prepayment'
import { ReceiptRefundPrepayment } from '../../../../_libs/database/repository/receipt/receipt-refund-prepayment'
import { ReceiptReturnProduct } from '../../../../_libs/database/repository/receipt/receipt-return-product'
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
    private readonly receiptReturnProduct: ReceiptReturnProduct,
    private readonly distributorPaymentRepository: DistributorPaymentRepository
  ) {}

  async pagination(oid: number, query: ReceiptPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { startedAt, deletedAt, distributorId } = query.filter || {}

    const { total, data } = await this.receiptRepository.pagination({
      page: query.page,
      limit: query.limit,
      condition: {
        oid,
        distributorId,
        status: query.filter?.status,
        startedAt,
        deletedAt,
      },
      relation: { distributor: query.relation?.distributor },
      sort: query.sort || { id: 'DESC' },
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: ReceiptGetManyQuery): Promise<BaseResponse> {
    const { relation, limit } = query
    const { startedAt, deletedAt, distributorId, status } = query.filter || {}

    const receiptList = await this.receiptRepository.findMany({
      condition: {
        oid,
        distributorId,
        status,
        startedAt,
        deletedAt,
      },
      limit,
      relation: { distributor: relation?.distributor },
    })
    return { data: receiptList }
  }

  async getOne(oid: number, id: number, { relation }: ReceiptGetOneQuery): Promise<BaseResponse> {
    const data = await this.receiptRepository.findOne({
      condition: { oid, id },
      relation: {
        distributor: !!relation?.distributor,
        distributorPayments: !!relation?.distributorPayments,
        receiptItems: relation?.receiptItems ? { batch: true, product: true } : false,
      },
    })
    if (!data) {
      throw new BusinessException('error.Database.NotFound')
    }
    return { data }
  }

  async queryOne(oid: number, id: number, { relation }: ReceiptGetOneQuery): Promise<BaseResponse> {
    const receipt = await this.receiptRepository.queryOneBy(
      { oid, id },
      {
        distributor: !!relation?.distributor,
        distributorPayments: !!relation?.distributorPayments,
        receiptItems: relation?.receiptItems ? { batch: true, product: true } : false,
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

  async updateReceiptDraftAndReceiptPrepayment(params: {
    oid: number
    receiptId: number
    body: ReceiptUpdateBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params
    try {
      await this.receiptDraft.updateReceiptDraftAndReceiptPrepayment({
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

  async destroyDraft(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    try {
      await this.receiptDraft.destroyDraft({ oid, receiptId })
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
      this.emitSocketAfterSendProductAndPayment(oid, result)
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
      this.socketEmitService.distributorUpsert(oid, { distributor })
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

  async returnProduct(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time, money } = params
    try {
      const result = await this.receiptReturnProduct.returnProduct({ oid, receiptId, time, money })
      const distributorPayments = await this.distributorPaymentRepository.findMany({
        condition: {
          oid,
          distributorId: result.receiptBasic.distributorId,
          receiptId,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
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

  async softDeleteRefund(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    try {
      await this.receiptDraft.softDeleteRefund({ oid, receiptId })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createQuickReceipt(options: {
    oid: number
    body: ReceiptDraftInsertBody
  }): Promise<BaseResponse> {
    const { oid, body } = options
    try {
      const { receiptId } = await this.receiptDraft.createDraft({
        oid,
        receiptInsertDto: body.receipt,
        receiptItemListDto: body.receiptItemList,
      })
      const result = await this.receiptSendProductAndPayment.sendProductAndPayment({
        oid,
        receiptId,
        time: Date.now(),
        money: body.receipt.totalMoney,
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateReceiptDebtAndReceiptSuccess(options: {
    oid: number
    receiptId: number
    time: number
    body: ReceiptUpdateBody
  }): Promise<BaseResponse> {
    const { oid, body, receiptId, time } = options
    const oldReceipt = await this.receiptRepository.findOneById(receiptId)
    try {
      await this.receiptReturnProduct.returnProduct({
        oid,
        receiptId,
        time,
        money: oldReceipt.paid,
        description: 'Hoàn trả để sửa đơn',
      })
      await this.receiptRepository.update({ oid, id: receiptId }, { status: ReceiptStatus.Draft })
      await this.receiptDraft.updateReceiptDraftAndReceiptPrepayment({
        oid,
        receiptId,
        receiptUpdateDto: body.receipt,
        receiptItemListDto: body.receiptItemList,
      })
      const result = await this.receiptSendProductAndPayment.sendProductAndPayment({
        oid,
        receiptId,
        time: Date.now(),
        money: oldReceipt.paid,
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async emitSocketAfterSendProductAndPayment(
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
