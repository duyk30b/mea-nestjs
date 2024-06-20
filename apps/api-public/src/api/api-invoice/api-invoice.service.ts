import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { InvoiceStatus, VoucherType } from '../../../../_libs/database/common/variable'
import { Batch, Customer, Product } from '../../../../_libs/database/entities'
import { CustomerPaymentRepository } from '../../../../_libs/database/repository/customer-payment/customer-payment.repository'
import { InvoiceDraft } from '../../../../_libs/database/repository/invoice/invoice-draft'
import { InvoicePayDebt } from '../../../../_libs/database/repository/invoice/invoice-pay-debt'
import { InvoicePrepayment } from '../../../../_libs/database/repository/invoice/invoice-prepayment'
import { InvoiceRefundPrepayment } from '../../../../_libs/database/repository/invoice/invoice-refund-prepayment'
import { InvoiceReturnProduct } from '../../../../_libs/database/repository/invoice/invoice-return-product'
import { InvoiceSendProductAndPayment } from '../../../../_libs/database/repository/invoice/invoice-send-product-and-payment'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  InvoiceDraftInsertBody,
  InvoiceGetManyQuery,
  InvoiceGetOneQuery,
  InvoicePaginationQuery,
  InvoiceSumDebtQuery,
  InvoiceUpdateBody,
} from './request'

@Injectable()
export class ApiInvoiceService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceDraft: InvoiceDraft,
    private readonly invoicePrepayment: InvoicePrepayment,
    private readonly invoiceRefundPrepayment: InvoiceRefundPrepayment,
    private readonly invoiceSendProductAndPayment: InvoiceSendProductAndPayment,
    private readonly invoicePayDebt: InvoicePayDebt,
    private readonly invoiceReturnProduct: InvoiceReturnProduct,
    private readonly customerPaymentRepository: CustomerPaymentRepository
  ) {}

  async pagination(oid: number, query: InvoicePaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, filter, relation } = query
    const { startedAt, deletedAt, customerId, status } = query.filter || {}

    const { data, total } = await this.invoiceRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId,
        status,
        startedAt,
        deletedAt,
      },
      relation: { customer: relation?.customer },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: InvoiceGetManyQuery): Promise<BaseResponse> {
    const { relation, limit, sort } = query
    const { startedAt, deletedAt, customerId, status } = query.filter || {}

    const data = await this.invoiceRepository.findMany({
      condition: {
        oid,
        customerId,
        status,
        startedAt,
        deletedAt,
      },
      relation: { customer: relation?.customer },
      limit,
      sort,
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
        invoiceItems: relation?.invoiceItems
          ? { procedure: true, batch: true, product: true }
          : false,
      }
    )
    if (!data) {
      throw new BusinessException('error.Database.NotFound')
    }
    return { data }
  }

  async createDraft(params: { oid: number; body: InvoiceDraftInsertBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { invoiceId } = await this.invoiceDraft.createDraft({
        oid,
        invoiceInsertDto: body.invoice,
        invoiceItemListDto: body.invoiceItemList,
        invoiceSurchargeListDto: body.invoiceSurchargeList,
        invoiceExpenseListDto: body.invoiceExpenseList,
      })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateInvoiceDraftAndInvoicePrepayment(params: {
    oid: number
    invoiceId: number
    body: InvoiceUpdateBody
  }): Promise<BaseResponse> {
    const { oid, invoiceId, body } = params
    try {
      await this.invoiceDraft.updateInvoiceDraftAndInvoicePrepayment({
        oid,
        invoiceId,
        invoiceUpdateDto: body.invoice,
        invoiceItemListDto: body.invoiceItemList,
        invoiceSurchargeListDto: body.invoiceSurchargeList,
        invoiceExpenseListDto: body.invoiceExpenseList,
      })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroyDraft(params: { oid: number; invoiceId: number }): Promise<BaseResponse> {
    const { oid, invoiceId } = params
    try {
      await this.invoiceDraft.destroyDraft({ oid, invoiceId })
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
      const { invoiceBasic } = await this.invoicePrepayment.prepayment({
        oid,
        invoiceId,
        time: Date.now(),
        money,
      })
      const customerPayments = await this.customerPaymentRepository.findMany({
        condition: {
          oid,
          customerId: invoiceBasic.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
        },
        sort: { id: 'ASC' },
      })
      return {
        data: {
          invoiceBasic,
          customerPayments,
        },
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundPrepayment(params: {
    oid: number
    invoiceId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, money } = params
    try {
      const { invoiceBasic } = await this.invoiceRefundPrepayment.refundPrepayment({
        oid,
        invoiceId,
        time: Date.now(),
        money,
      })
      const customerPayments = await this.customerPaymentRepository.findMany({
        condition: {
          oid,
          customerId: invoiceBasic.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
        },
        sort: { id: 'ASC' },
      })
      return { data: { invoiceBasic, customerPayments } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProductAndPayment(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, time, money } = params
    try {
      const result = await this.invoiceSendProductAndPayment.sendProductAndPayment({
        oid,
        invoiceId,
        time,
        money,
      })
      const customerPayments = await this.customerPaymentRepository.findMany({
        condition: {
          oid,
          customerId: result.invoiceBasic.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return {
        data: {
          invoiceBasic: result.invoiceBasic,
          customerPayments,
        },
      }
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
      const { customer, invoiceBasic } = await this.invoicePayDebt.payDebt({
        oid,
        invoiceId,
        time,
        money,
      })
      const customerPayments = await this.customerPaymentRepository.findMany({
        condition: {
          oid,
          customerId: invoiceBasic.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
        },
        sort: { id: 'ASC' },
      })
      this.socketEmitService.customerUpsert(oid, { customer })
      return {
        data: {
          invoiceBasic,
          customerPayments,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, invoiceId, time, money } = params
    try {
      const result = await this.invoiceReturnProduct.returnProduct({ oid, invoiceId, time, money })
      const customerPayments = await this.customerPaymentRepository.findMany({
        condition: {
          oid,
          customerId: result.invoiceBasic.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
        },
        sort: { id: 'ASC' },
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return {
        data: {
          invoiceBasic: result.invoiceBasic,
          customerPayments,
        },
      }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async softDeleteRefund(params: { oid: number; invoiceId: number }): Promise<BaseResponse> {
    const { oid, invoiceId } = params
    try {
      await this.invoiceDraft.softDeleteRefund({ oid, invoiceId })
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createQuickInvoice(options: {
    oid: number
    body: InvoiceDraftInsertBody
  }): Promise<BaseResponse> {
    const { oid, body } = options
    try {
      const { invoiceId } = await this.invoiceDraft.createDraft({
        oid,
        invoiceInsertDto: body.invoice,
        invoiceItemListDto: body.invoiceItemList,
        invoiceSurchargeListDto: body.invoiceSurchargeList,
        invoiceExpenseListDto: body.invoiceExpenseList,
      })
      const result = await this.invoiceSendProductAndPayment.sendProductAndPayment({
        oid,
        invoiceId,
        time: Date.now(),
        money: body.invoice.totalMoney,
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateInvoiceDebtAndInvoiceSuccess(options: {
    oid: number
    invoiceId: number
    time: number
    body: InvoiceUpdateBody
  }): Promise<BaseResponse> {
    const { oid, body, invoiceId, time } = options
    const oldInvoice = await this.invoiceRepository.findOneById(invoiceId)
    try {
      await this.invoiceReturnProduct.returnProduct({
        oid,
        invoiceId,
        time,
        money: oldInvoice.paid,
        description: 'Hoàn trả để sửa đơn',
      })
      await this.invoiceRepository.update({ oid, id: invoiceId }, { status: InvoiceStatus.Draft })
      await this.invoiceDraft.updateInvoiceDraftAndInvoicePrepayment({
        oid,
        invoiceId,
        invoiceUpdateDto: body.invoice,
        invoiceItemListDto: body.invoiceItemList,
        invoiceSurchargeListDto: body.invoiceSurchargeList,
        invoiceExpenseListDto: body.invoiceExpenseList,
      })
      const result = await this.invoiceSendProductAndPayment.sendProductAndPayment({
        oid,
        invoiceId,
        time: Date.now(),
        money: oldInvoice.paid,
      })
      this.emitSocketAfterSendProductAndPayment(oid, result)
      return { data: { invoiceId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sumInvoiceDebt(oid: number, { filter }: InvoiceSumDebtQuery): Promise<BaseResponse> {
    const sum = await this.invoiceRepository.sumInvoiceDebt({
      oid,
      startedAt: filter?.startedAt,
    })
    return { data: { sumInvoiceDebt: sum } }
  }

  async emitSocketAfterSendProductAndPayment(
    oid: number,
    data: { customer: Customer; productList: Product[]; batchList: Batch[] }
  ) {
    const { customer, productList, batchList } = data
    if (customer) {
      this.socketEmitService.customerUpsert(oid, { customer })
    }
    if (productList.length) {
      this.socketEmitService.productListUpdate(oid, { productList })
    }
    if (batchList.length) {
      this.socketEmitService.batchListUpdate(oid, { batchList })
    }
  }
}
