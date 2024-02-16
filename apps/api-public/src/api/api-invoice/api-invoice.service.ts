import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  InvoiceDraftInsertDto,
  InvoiceDraftUpdateDto,
  InvoiceProcessRepository,
  InvoiceRepository,
} from '../../../../_libs/database/repository'
import {
  InvoiceDraftCreateBody,
  InvoiceDraftUpdateBody,
  InvoiceGetManyQuery,
  InvoiceGetOneQuery,
  InvoicePaginationQuery,
  InvoiceSumDebtQuery,
} from './request'

@Injectable()
export class ApiInvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceProcessRepository: InvoiceProcessRepository
  ) {}

  async pagination(oid: number, query: InvoicePaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, filter, relation } = query
    const { time, deleteTime, customerId, status } = query.filter || {}

    const { data, total } = await this.invoiceRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId,
        status,
        time,
        deleteTime,
      },
      relation: { customer: relation?.customer },
      sort: sort || { id: 'DESC' },
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: InvoiceGetManyQuery): Promise<BaseResponse> {
    const { relation, limit } = query
    const { time, deleteTime, customerId, status } = query.filter || {}

    const data = await this.invoiceRepository.findMany({
      condition: {
        oid,
        customerId,
        status,
        time,
        deleteTime,
      },
      relation: { customer: relation?.customer },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, { relation }: InvoiceGetOneQuery): Promise<BaseResponse> {
    const data = await this.invoiceRepository.queryOne(
      { oid, id },
      {
        customer: !!relation?.customer,
        customerPayments: !!relation?.customerPayments,
        invoiceExpenses: !!relation?.invoiceExpenses,
        invoiceSurcharges: !!relation?.invoiceSurcharges,
        invoiceItems: relation?.invoiceItems && {
          procedure: true,
          productBatch: { product: true },
        },
      }
    )
    return { data }
  }

  async createBasic(params: { oid: number; body: InvoiceDraftCreateBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { invoiceId } = await this.invoiceProcessRepository.createDraft({
        oid,
        invoiceInsertDto: InvoiceDraftInsertDto.from(body),
      })
      await this.invoiceProcessRepository.startShipAndPayment({
        oid,
        invoiceId,
        time: Date.now(),
        money: body.revenue,
      })

      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateBasic(params: {
    oid: number
    oldInvoiceId: number
    time: number
    body: InvoiceDraftUpdateBody
  }): Promise<BaseResponse> {
    const { oid, body, oldInvoiceId, time } = params
    try {
      await this.invoiceProcessRepository.startRefund({ oid, invoiceId: oldInvoiceId, time })
      await this.invoiceProcessRepository.softDeleteRefund({ oid, invoiceId: oldInvoiceId })

      const { invoiceId } = await this.invoiceProcessRepository.createDraft({
        oid,
        invoiceInsertDto: InvoiceDraftInsertDto.from(body),
      })
      await this.invoiceProcessRepository.startShipAndPayment({
        oid,
        invoiceId,
        time: Date.now(),
        money: body.revenue,
      })

      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createDraft(params: { oid: number; body: InvoiceDraftCreateBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { invoiceId } = await this.invoiceProcessRepository.createDraft({
        oid,
        invoiceInsertDto: InvoiceDraftInsertDto.from(body),
      })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraft(params: {
    oid: number
    invoiceId: number
    body: InvoiceDraftUpdateBody
  }): Promise<BaseResponse> {
    const { oid, invoiceId, body } = params
    try {
      await this.invoiceProcessRepository.updateDraft({
        oid,
        invoiceId,
        invoiceUpdateDto: InvoiceDraftUpdateDto.from(body),
      })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroyDraft(params: { oid: number; invoiceId: number }): Promise<BaseResponse> {
    const { oid, invoiceId } = params
    try {
      await this.invoiceProcessRepository.destroyDraft({ oid, invoiceId })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(params: {
    oid: number
    invoiceId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, money } = params
    try {
      await this.invoiceProcessRepository.prepayment({
        oid,
        invoiceId,
        time: Date.now(),
        money,
      })
      return { data: { invoiceId } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async startShipAndPayment(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, time, money } = params
    try {
      await this.invoiceProcessRepository.startShipAndPayment({ oid, invoiceId, time, money })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, time, money } = params
    try {
      await this.invoiceProcessRepository.payDebt({ oid, invoiceId, time, money })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async startRefund(params: {
    oid: number
    invoiceId: number
    time: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, time } = params
    try {
      await this.invoiceProcessRepository.startRefund({ oid, invoiceId, time })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async softDeleteRefund(params: { oid: number; invoiceId: number }): Promise<BaseResponse> {
    const { oid, invoiceId } = params
    try {
      await this.invoiceProcessRepository.softDeleteRefund({ oid, invoiceId })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sumInvoiceDebt(oid: number, { filter }: InvoiceSumDebtQuery): Promise<BaseResponse> {
    const sum = await this.invoiceRepository.sumInvoiceDebt({
      oid,
      time: filter?.time,
    })
    return { data: { sumInvoiceDebt: sum } }
  }
}
