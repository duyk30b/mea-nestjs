// import InvoiceExpense, { InvoiceExpenseInsertType } from '../../entities/invoice-expense.entity'
// import InvoiceItem, { InvoiceItemInsertType } from '../../entities/invoice-item.entity'
// import InvoiceSurcharge, {
//   InvoiceSurchargeInsertType,
// } from '../../entities/invoice-surcharge.entity'
// import Invoice, { InvoiceInsertType, InvoiceUpdateType } from '../../entities/invoice.entity'

// export type InvoiceDraftInsertType = Omit<
//   InvoiceInsertType,
//   keyof Pick<Invoice, 'oid' | 'status' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt'>
// >

// export type InvoiceDraftUpdateType = Omit<
//   InvoiceUpdateType,
//   keyof Pick<
//     Invoice,
//     'oid' | 'status' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt' | 'deletedAt'
//   >
// >

// export type InvoiceItemDraftType = Omit<
//   InvoiceItemInsertType,
//   'oid' | keyof Pick<InvoiceItem, 'invoiceId' | 'customerId'>
// >
// export type InvoiceSurchargeDraftType = Omit<
//   InvoiceSurchargeInsertType,
//   'oid' | keyof Pick<InvoiceSurcharge, 'invoiceId'> | 'invoiceId'
// >
// export type InvoiceExpenseDraftType = Omit<
//   InvoiceExpenseInsertType,
//   'oid' | keyof Pick<InvoiceExpense, 'invoiceId'> | 'invoiceId'
// >
