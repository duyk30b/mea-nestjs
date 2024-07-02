import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { VisitStatus, VisitType } from '../../../../../_libs/database/entities/visit.entity'
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

  async prepayment(oid: number, body: VisitPaymentBody) {
    try {
      const oldVisit = await this.visitRepository.findOneById(body.visitId)
      if (oldVisit.visitStatus === VisitStatus.Draft) {
        const affected = await this.visitRepository.update(
          { oid, id: body.visitId, visitType: VisitType.Invoice, visitStatus: VisitStatus.Draft },
          { visitStatus: VisitStatus.InProgress }
        )
        if (affected != 1) {
          throw new BusinessException('error.Database.UpdateFailed')
        }
      }

      const { visitBasic } = await this.visitPrepayment.prepayment({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        money: body.money,
      })

      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
