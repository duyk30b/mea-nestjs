import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { VoucherType } from '../../../../../_libs/database/common/variable'
import { VisitStatus } from '../../../../../_libs/database/entities/visit.entity'
import { InvoiceVisitRepository } from '../../../../../_libs/database/repository/visit/invoice-visit/invoice-visit.repository'
import { VisitPrepayment } from '../../../../../_libs/database/repository/visit/visit-prepayment'
import { VisitRepository } from '../../../../../_libs/database/repository/visit/visit.repository'
import { VisitPaymentBody } from '../request'
import {
  InvoiceVisitInsertBody,
  InvoiceVisitUpdateBody,
} from './request/invoice-visit-draft-upsert.body'

@Injectable()
export class ApiInvoiceVisitService {
  constructor(
    private readonly invoiceVisitRepository: InvoiceVisitRepository,
    private readonly visitRepository: VisitRepository,
    private readonly visitPrepayment: VisitPrepayment
  ) {}

  async createDraft(params: { oid: number; body: InvoiceVisitInsertBody }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { visitId } = await this.invoiceVisitRepository.createDraft({
        oid,
        visitDraftInsert: body.visitDraftInsert,
        visitProductDraftList: body.visitProductDraftList,
        visitProcedureDraftList: body.visitProcedureDraftList,
        visitSurchargeDraftList: body.visitSurchargeDraftList,
        visitExpenseDraftList: body.visitExpenseDraftList,
      })
      return { data: { visitId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraft(params: {
    oid: number
    visitId: number
    body: InvoiceVisitUpdateBody
  }): Promise<BaseResponse> {
    const { oid, visitId, body } = params
    try {
      await this.invoiceVisitRepository.updateDraft({
        oid,
        visitId,
        visitDraftUpdate: body.visitDraftUpdate,
        visitProductDraftList: body.visitProductDraftList,
        visitProcedureDraftList: body.visitProcedureDraftList,
        visitSurchargeDraftList: body.visitSurchargeDraftList,
        visitExpenseDraftList: body.visitExpenseDraftList,
      })
      return { data: { visitId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroyDraft(params: { oid: number; visitId: number }): Promise<BaseResponse> {
    const { oid, visitId } = params
    try {
      await this.invoiceVisitRepository.destroyDraft({ oid, visitId })
      return { data: { visitId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(options: {
    oid: number
    visitId: number
    body: VisitPaymentBody
  }): Promise<BaseResponse> {
    const { oid, visitId, body } = options
    try {
      const oldVisit = await this.visitRepository.findOneById(visitId)
      if (oldVisit.visitStatus === VisitStatus.Draft) {
        const affected = await this.visitRepository.update(
          { oid, id: visitId, voucherType: VoucherType.Invoice, visitStatus: VisitStatus.Draft },
          { visitStatus: VisitStatus.InProgress }
        )
        if (affected != 1) {
          throw new BusinessException('error.Database.UpdateFailed')
        }
      }

      const { visitBasic, customerPayment } = await this.visitPrepayment.prepayment({
        oid,
        visitId,
        time: Date.now(),
        money: body.money,
      })

      return { data: { visitBasic, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProductAndPayment(params: {
    oid: number
    visitId: number
    time: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, visitId, time, money } = params
    try {
      const result = await this.invoiceSendProductAndPayment.sendProductAndPayment({
        oid,
        visitId,
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
}
