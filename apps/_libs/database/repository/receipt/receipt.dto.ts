import ReceiptItem, { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import Receipt, { ReceiptInsertType, ReceiptUpdateType } from '../../entities/receipt.entity'

export type ReceiptDraftInsertType = Omit<
  ReceiptInsertType,
  keyof Pick<Receipt, 'oid' | 'status' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt'>
>

export type ReceiptDraftUpdateType = Omit<
  ReceiptUpdateType,
  keyof Pick<Receipt, 'oid' | 'status' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt'>
>

export type ReceiptItemDraftType = Omit<
  ReceiptItemInsertType,
  keyof Pick<ReceiptItem, 'oid' | 'receiptId' | 'distributorId'>
>
