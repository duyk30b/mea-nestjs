import { VisitBatch, VisitProcedure, VisitProduct } from '../../../entities'
import { VisitBatchRelationType } from '../../../entities/visit-batch.entity'
import VisitExpense, { VisitExpenseRelationType } from '../../../entities/visit-expense.entity'
import { VisitProcedureRelationType } from '../../../entities/visit-procedure.entity'
import { VisitProductRelationType } from '../../../entities/visit-product.entity'
import VisitSurcharge, {
  VisitSurchargeRelationType,
} from '../../../entities/visit-surcharge.entity'
import Visit, { VisitRelationType } from '../../../entities/visit.entity'

export type InvoiceVisitDraftInsertType = Omit<
  Visit,
  | keyof VisitRelationType
  | keyof Pick<
      Visit,
      | 'oid'
      | 'id'
      | 'visitType'
      | 'visitStatus'
      | 'isSent'
      | 'paid'
      | 'debt'
      | 'year'
      | 'month'
      | 'date'
      | 'startedAt'
      | 'updatedAt'
      | 'endedAt'
    >
>

export type InvoiceVisitDraftUpdateType = Omit<
  Visit,
  | keyof VisitRelationType
  | keyof Pick<
      Visit,
      | 'oid'
      | 'id'
      | 'customerId' // không được update customerId
      | 'visitType'
      | 'visitStatus'
      | 'isSent'
      | 'paid'
      | 'debt'
      | 'year'
      | 'month'
      | 'date'
      | 'startedAt'
      | 'updatedAt'
      | 'endedAt'
    >
>

export type InvoiceVisitProductDraftType = Omit<
  VisitProduct,
  | keyof VisitProductRelationType
  | keyof Pick<
      VisitProduct,
      'oid' | 'id' | 'visitId' | 'customerId' | 'isSent' | 'quantityPrescription'
    >
>

export type InvoiceVisitProcedureDraftType = Omit<
  VisitProcedure,
  | keyof VisitProcedureRelationType
  | keyof Pick<VisitProcedure, 'oid' | 'id' | 'visitId' | 'customerId' | 'createdAt'>
>

export type InvoiceVisitSurchargeDraftType = Omit<
  VisitSurcharge,
  keyof VisitSurchargeRelationType | keyof Pick<VisitSurcharge, 'oid' | 'id' | 'visitId'>
>
export type InvoiceVisitExpenseDraftType = Omit<
  VisitExpense,
  keyof VisitExpenseRelationType | keyof Pick<VisitExpense, 'oid' | 'id' | 'visitId'>
>
