import { TicketProcedure, TicketProduct } from '../../../entities'
import TicketExpense, { TicketExpenseRelationType } from '../../../entities/ticket-expense.entity'
import { TicketProcedureRelationType } from '../../../entities/ticket-procedure.entity'
import { TicketProductRelationType } from '../../../entities/ticket-product.entity'
import TicketSurcharge, {
  TicketSurchargeRelationType,
} from '../../../entities/ticket-surcharge.entity'
import Ticket, { TicketRelationType } from '../../../entities/ticket.entity'

export type TicketOrderDraftInsertType = Omit<
  Ticket,
  | keyof TicketRelationType
  | keyof Pick<
    Ticket,
    | 'oid'
    | 'id'
    | 'voucherType'
    | 'ticketStatus'
    | 'deliveryStatus'
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

export type TicketOrderDraftApprovedUpdateType = Omit<
  Ticket,
  | keyof TicketRelationType
  | keyof Pick<
    Ticket,
    | 'oid'
    | 'id'
    | 'customerId' // không được update customerId
    | 'voucherType'
    | 'ticketStatus'
    | 'deliveryStatus'
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

export type TicketOrderDebtSuccessUpdateType = Omit<
  Ticket,
  | keyof TicketRelationType
  | keyof Pick<
    Ticket,
    | 'oid'
    | 'id'
    | 'customerId' // không được update customerId
    | 'voucherType'
    | 'ticketStatus'
    | 'deliveryStatus'
    | 'debt'
    | 'year'
    | 'month'
    | 'date'
    | 'startedAt'
    | 'updatedAt'
    | 'endedAt'
  >
>

export type TicketOrderProductDraftType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<
    TicketProduct,
    | 'oid'
    | 'id'
    | 'ticketId'
    | 'customerId'
    | 'deliveryStatus'
    | 'quantityPrescription'
    | 'quantityReturn'
  >
>

export type TicketOrderProcedureDraftType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<TicketProcedure, 'oid' | 'id' | 'ticketId' | 'customerId' | 'createdAt'>
>

export type TicketOrderSurchargeDraftType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'oid' | 'id' | 'ticketId'>
>
export type TicketOrderExpenseDraftType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'oid' | 'id' | 'ticketId'>
>
