import { TicketProcedure, TicketProduct } from '../../entities'
import TicketExpense, { TicketExpenseRelationType } from '../../entities/ticket-expense.entity'
import { TicketProcedureRelationType } from '../../entities/ticket-procedure.entity'
import { TicketProductRelationType } from '../../entities/ticket-product.entity'
import TicketSurcharge, {
  TicketSurchargeRelationType,
} from '../../entities/ticket-surcharge.entity'

export type TicketOrderProductDraftType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<
    TicketProduct,
    'oid' | 'id' | 'ticketId' | 'deliveryStatus' | 'customerId' | 'quantityPrescription' | 'type'
  >
>

export type TicketOrderProcedureDraftType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'status' | 'startedAt' | 'completedSessions'
  >
>

export type TicketOrderSurchargeDraftType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'oid' | 'id' | 'ticketId'>
>
export type TicketOrderExpenseDraftType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'oid' | 'id' | 'ticketId'>
>
