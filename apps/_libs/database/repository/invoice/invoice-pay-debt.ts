// import { Injectable } from '@nestjs/common'
// import { DataSource, FindOptionsWhere, Raw, UpdateResult } from 'typeorm'
// import { InvoiceStatus, PaymentType, VoucherType } from '../../common/variable'
// import { Customer, CustomerPayment, Invoice } from '../../entities'
// import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'

// @Injectable()
// export class InvoicePayDebt {
//   constructor(private dataSource: DataSource) {}

//   async payDebt(params: { oid: number; invoiceId: number; time: number; money: number }) {
//     const { oid, invoiceId, time, money } = params
//     const PREFIX = `invoiceId=${invoiceId} pay debt failed`

//     if (money <= 0) {
//       throw new Error(`${PREFIX}: money=${money}`)
//     }

//     const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
//       // === 1. UPDATE INVOICE ===
//       const whereInvoice: FindOptionsWhere<Invoice> = {
//         oid,
//         id: invoiceId,
//         status: InvoiceStatus.Debt,
//         totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
//       }
//       const invoiceUpdateResult: UpdateResult = await manager
//         .createQueryBuilder()
//         .update(Invoice)
//         .where(whereInvoice)
//         .set({
//           status: () => `CASE
//                             WHEN("totalMoney" - paid = ${money}) THEN ${InvoiceStatus.Success}
//                             ELSE ${InvoiceStatus.Debt}
//                             END
//                         `,
//           debt: () => `debt - ${money}`,
//           paid: () => `paid + ${money}`,
//         })
//         .returning('*')
//         .execute()
//       if (invoiceUpdateResult.affected !== 1) {
//         throw new Error(`${PREFIX}: Update Invoice failed`)
//       }
//       const invoice = Invoice.fromRaw(invoiceUpdateResult.raw[0])

//       // === 2. UPDATE CUSTOMER ===
//       const whereCustomer: FindOptionsWhere<Customer> = { id: invoice.customerId }
//       const customerUpdateResult: UpdateResult = await manager
//         .createQueryBuilder()
//         .update(Customer)
//         .where(whereCustomer)
//         .set({
//           debt: () => `debt - ${money}`,
//         })
//         .returning('*')
//         .execute()
//       if (customerUpdateResult.affected !== 1) {
//         throw new Error(`${PREFIX}: customerId=${invoice.customerId} update failed`)
//       }
//       const customer = Customer.fromRaw(customerUpdateResult.raw[0])

//       const customerCloseDebt = customer.debt
//       const customerOpenDebt = customerCloseDebt + money

//       // === 3. INSERT CUSTOMER_PAYMENT ===
//       const customerPaymentDraft: CustomerPaymentInsertType = {
//         oid,
//         customerId: invoice.customerId,
//         ticketId: invoiceId,
//         voucherType: VoucherType.Order,
//         createdAt: time,
//         paymentType: PaymentType.PayDebt,
//         paid: money,
//         debit: -money,
//         openDebt: customerOpenDebt,
//         closeDebt: customerCloseDebt,
//         note: '',
//         description: '',
//       }
//       const customerPaymentInsertResult = await manager.insert(
//         CustomerPayment,
//         customerPaymentDraft
//       )

//       const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
//       if (!customerPaymentId) {
//         throw new Error(
//           `${PREFIX}: Insert CustomerPayment failed: ` +
//             `${JSON.stringify(customerPaymentInsertResult)}`
//         )
//       }

//       return { customer, invoiceBasic: invoice }
//     })

//     return transaction
//   }
// }
