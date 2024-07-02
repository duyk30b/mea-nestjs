import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { InvoiceVisitRepository } from '../../../../../_libs/database/repository/visit/invoice-visit/invoice-visit.repository'
import { VisitRepository } from '../../../../../_libs/database/repository/visit/visit.repository'
import {
  InvoiceVisitInsertBody,
  InvoiceVisitUpdateBody,
} from './request/invoice-visit-draft-upsert.body'

@Injectable()
export class ApiInvoiceVisitService {
  constructor(
    private readonly invoiceVisitRepository: InvoiceVisitRepository,
    private readonly visitRepository: VisitRepository
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
}
