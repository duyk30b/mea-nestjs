import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import VisitExpense, { VisitExpenseInsertType } from '../../../entities/visit-expense.entity'
import VisitProcedure, { VisitProcedureInsertType } from '../../../entities/visit-procedure.entity'
import VisitProduct, { VisitProductInsertType } from '../../../entities/visit-product.entity'
import VisitSurcharge, { VisitSurchargeInsertType } from '../../../entities/visit-surcharge.entity'
import Visit, { VisitInsertType, VisitStatus, VisitType } from '../../../entities/visit.entity'
import {
  InvoiceVisitDraftInsertType,
  InvoiceVisitDraftUpdateType,
  InvoiceVisitExpenseDraftType,
  InvoiceVisitProcedureDraftType,
  InvoiceVisitProductDraftType,
  InvoiceVisitSurchargeDraftType,
} from './invoice-visit.dto'

@Injectable()
export class InvoiceVisitRepository {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

  async createDraft<T extends InvoiceVisitDraftInsertType>(params: {
    oid: number
    visitDraftInsert: NoExtra<InvoiceVisitDraftInsertType, T>
    visitProductDraftList: InvoiceVisitProductDraftType[]
    visitProcedureDraftList: InvoiceVisitProcedureDraftType[]
    visitSurchargeDraftList: InvoiceVisitSurchargeDraftType[]
    visitExpenseDraftList: InvoiceVisitExpenseDraftType[]
  }) {
    const {
      oid,
      visitProductDraftList,
      visitProcedureDraftList,
      visitSurchargeDraftList,
      visitExpenseDraftList,
    } = params
    const visitDraftInsert: InvoiceVisitDraftInsertType = params.visitDraftInsert

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const visitInsert: NoExtra<VisitInsertType> = {
        ...visitDraftInsert,
        oid,
        visitStatus: VisitStatus.Draft,
        visitType: VisitType.Invoice,
        isSent: 0,
        paid: 0,
        debt: 0,
        year: 0,
        month: 0,
        date: 0,
        startedAt: null,
        endedAt: null,
      }
      const visitInsertResult = await manager.insert(Visit, visitInsert)
      const visitId: number = visitInsertResult.identifiers?.[0]?.id
      if (!visitId) {
        throw new Error(`Create Visit failed: Insert error ${JSON.stringify(visitInsertResult)}`)
      }

      if (visitProductDraftList.length) {
        const visitProductListInsert = visitProductDraftList.map((i) => {
          const visitProduct: NoExtra<VisitProductInsertType> = {
            ...i,
            oid,
            visitId,
            customerId: visitDraftInsert.customerId,
            isSent: 0,
            quantityPrescription: i.quantity,
          }
          return visitProduct
        })
        await manager.insert(VisitProduct, visitProductListInsert)
      }

      if (visitProcedureDraftList) {
        const visitProcedureListInsert = visitProcedureDraftList.map((i) => {
          const visitProcedure: VisitProcedureInsertType = {
            ...i,
            oid,
            visitId,
            customerId: visitDraftInsert.customerId,
            createdAt: visitDraftInsert.registeredAt,
          }
          return visitProcedure
        })
        await manager.insert(VisitProcedure, visitProcedureListInsert)
      }

      if (visitSurchargeDraftList.length) {
        const visitSurchargeListInsert = visitSurchargeDraftList.map((i) => {
          const visitSurcharge: VisitSurchargeInsertType = {
            ...i,
            oid,
            visitId,
          }
          return visitSurcharge
        })
        await manager.insert(VisitSurcharge, visitSurchargeListInsert)
      }

      if (visitExpenseDraftList.length) {
        const visitExpenseListInsert = visitExpenseDraftList.map((i) => {
          const visitExpense: VisitExpenseInsertType = {
            ...i,
            oid,
            visitId,
          }
          return visitExpense
        })
        await manager.insert(VisitExpense, visitExpenseListInsert)
      }

      return { visitId }
    })
  }

  async updateDraft<T extends InvoiceVisitDraftUpdateType>(params: {
    oid: number
    visitId: number
    visitDraftUpdate: NoExtra<InvoiceVisitDraftUpdateType, T>
    visitProductDraftList: InvoiceVisitProductDraftType[]
    visitProcedureDraftList: InvoiceVisitProcedureDraftType[]
    visitSurchargeDraftList: InvoiceVisitSurchargeDraftType[]
    visitExpenseDraftList: InvoiceVisitExpenseDraftType[]
  }) {
    const {
      oid,
      visitId,
      visitDraftUpdate,
      visitProductDraftList,
      visitProcedureDraftList,
      visitSurchargeDraftList,
      visitExpenseDraftList,
    } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereVisit: FindOptionsWhere<Visit> = {
        id: visitId,
        oid,
        visitStatus: In([VisitStatus.Draft]),
        isSent: 0,
      }
      const visitUpdateResult = await manager
        .createQueryBuilder()
        .update(Visit)
        .where(whereVisit)
        .set(visitDraftUpdate)
        .returning('*')
        .execute()
      if (visitUpdateResult.affected !== 1) {
        throw new Error(`Update Visit ${visitId} failed: Status invalid`)
      }
      const visit = Visit.fromRaw(visitUpdateResult.raw[0])

      await manager.delete(VisitProduct, { oid, visitId })
      await manager.delete(VisitProcedure, { oid, visitId })
      await manager.delete(VisitSurcharge, { oid, visitId })
      await manager.delete(VisitExpense, { oid, visitId })

      if (visitProductDraftList.length) {
        const visitProductListInsert = visitProductDraftList.map((i) => {
          const visitProduct: NoExtra<VisitProductInsertType> = {
            ...i,
            oid,
            visitId,
            customerId: visit.customerId,
            quantityPrescription: i.quantity, // cho lấy số lượng kê đơn bằng số lượng bán
            isSent: 0,
          }
          return visitProduct
        })
        await manager.insert(VisitProduct, visitProductListInsert)
      }

      if (visitProcedureDraftList.length) {
        const visitProcedureListInsert = visitProcedureDraftList.map((i) => {
          const visitProcedure: VisitProcedureInsertType = {
            ...i,
            oid,
            visitId,
            customerId: visit.customerId,
            createdAt: visit.registeredAt,
          }
          return visitProcedure
        })
        await manager.insert(VisitProcedure, visitProcedureListInsert)
      }

      if (visitSurchargeDraftList.length) {
        const visitSurchargeListInsert = visitSurchargeDraftList.map((i) => {
          const visitSurcharge: VisitSurchargeInsertType = {
            ...i,
            oid,
            visitId,
          }
          return visitSurcharge
        })
        await manager.insert(VisitSurcharge, visitSurchargeListInsert)
      }

      if (visitExpenseDraftList.length) {
        const visitExpenseListInsert = visitExpenseDraftList.map((i) => {
          const visitExpense: VisitExpenseInsertType = {
            ...i,
            oid,
            visitId,
          }
          return visitExpense
        })
        await manager.insert(VisitExpense, visitExpenseListInsert)
      }

      return { visitId }
    })
  }

  async destroyDraft(params: { oid: number; visitId: number }) {
    const { oid, visitId } = params
    const whereVisit: FindOptionsWhere<Visit> = {
      id: visitId,
      oid,
      visitStatus: In([VisitStatus.Draft]),
      isSent: 0,
    }
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const visitDeleteResult = await manager.delete(Visit, whereVisit)
      if (visitDeleteResult.affected !== 1) {
        throw new Error(`Destroy Visit ${visitId} failed: Status invalid`)
      }
      await manager.delete(VisitProduct, { oid, visitId })
      await manager.delete(VisitProcedure, { oid, visitId })
      await manager.delete(VisitSurcharge, { oid, visitId })
      await manager.delete(VisitExpense, { oid, visitId })
    })
  }
}
