import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ReceiptProcessRepository } from '../../../../_libs/database/repository/receipt/receipt-process.repository'
import { ReceiptRefund } from '../../../../_libs/database/repository/receipt/receipt-refund'
import { ReceiptShipAndPayment } from '../../../../_libs/database/repository/receipt/receipt-ship-and-payment'
import {
  ReceiptInsertDto,
  ReceiptUpdateDto,
} from '../../../../_libs/database/repository/receipt/receipt.dto'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import {
  ReceiptDraftCreateBody,
  ReceiptDraftUpdateBody,
  ReceiptGetManyQuery,
  ReceiptGetOneQuery,
  ReceiptPaginationQuery,
} from './request'

@Injectable()
export class ApiReceiptService {
  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptProcessRepository: ReceiptProcessRepository,
    private readonly receiptShipAndPayment: ReceiptShipAndPayment,
    private readonly receiptRefund: ReceiptRefund
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
    const receipt = await this.receiptRepository.findOne({
      condition: { oid, id },
      relation: {
        distributor: !!relation?.distributor,
        distributorPayments: !!relation?.distributorPayments,
        receiptItems: relation?.receiptItems ? { batch: true, product: true } : false,
      },
    })
    return { data: receipt }
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

  async createBasic(params: { oid: number; body: ReceiptDraftCreateBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { receiptId } = await this.receiptProcessRepository.createDraft({
        oid,
        receiptInsertDto: ReceiptInsertDto.from(body),
      })
      await this.receiptShipAndPayment.startShipAndPayment({
        oid,
        receiptId,
        time: Date.now(),
        money: body.revenue,
      })

      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateBasic(params: {
    oid: number
    oldReceiptId: number
    time: number
    body: ReceiptDraftCreateBody
  }): Promise<BaseResponse> {
    const { oid, body, oldReceiptId, time } = params
    try {
      await this.receiptRefund.startRefund({ oid, receiptId: oldReceiptId, time })
      await this.receiptProcessRepository.softDeleteRefund({ oid, receiptId: oldReceiptId })

      const { receiptId } = await this.receiptProcessRepository.createDraft({
        oid,
        receiptInsertDto: ReceiptInsertDto.from(body),
      })
      await this.receiptShipAndPayment.startShipAndPayment({
        oid,
        receiptId,
        time: Date.now(),
        money: body.revenue,
      })

      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createDraft(params: { oid: number; body: ReceiptDraftCreateBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { receiptId } = await this.receiptProcessRepository.createDraft({
        oid,
        receiptInsertDto: ReceiptInsertDto.from(body),
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraft(params: {
    oid: number
    receiptId: number
    body: ReceiptDraftUpdateBody
  }): Promise<BaseResponse> {
    const { oid, receiptId, body } = params
    try {
      await this.receiptProcessRepository.updateDraft({
        oid,
        receiptId,
        receiptUpdateDto: ReceiptUpdateDto.from(body),
      })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroyDraft(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    try {
      await this.receiptProcessRepository.destroyDraft({ oid, receiptId })
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
      await this.receiptProcessRepository.prepayment({
        oid,
        receiptId,
        time: Date.now(),
        money,
      })
      return { data: { receiptId } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async startShipAndPayment(params: {
    oid: number
    receiptId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time, money } = params
    try {
      await this.receiptShipAndPayment.startShipAndPayment({ oid, receiptId, time, money })
      return { data: { receiptId } }
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
      await this.receiptProcessRepository.payDebt({ oid, receiptId, time, money })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async startRefund(params: {
    oid: number
    receiptId: number
    time: number
  }): Promise<BaseResponse> {
    const { oid, receiptId, time } = params
    try {
      await this.receiptRefund.startRefund({ oid, receiptId, time })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async softDeleteRefund(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    try {
      await this.receiptProcessRepository.softDeleteRefund({ oid, receiptId })
      return { data: { receiptId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
