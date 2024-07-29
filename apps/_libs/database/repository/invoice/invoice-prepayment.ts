// import { Injectable } from '@nestjs/common'
// import { DataSource, FindOptionsWhere, In, Raw, UpdateResult } from 'typeorm'
// import { InvoiceStatus, PaymentType, VoucherType } from '../../common/variable'
// import { Customer, CustomerPayment, Invoice } from '../../entities'
// import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'

// @Injectable()
// export class InvoicePrepayment {
//   constructor(private dataSource: DataSource) {}

//   async prepayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
//     const { oid, invoiceId, time, money } = params
//     if (money < 0) {
//       throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
//     }

//     const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
//       // === 1. UPDATE INVOICE ===
//       const whereInvoice: FindOptionsWhere<Invoice> = {
//         oid,
//         id: invoiceId,
//         status: In([InvoiceStatus.Draft, InvoiceStatus.Prepayment]),
//         totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
//       }
//       const invoiceUpdateResult: UpdateResult = await manager
//         .createQueryBuilder()
//         .update(Invoice)
//         .where(whereInvoice)
//         .set({
//           status: InvoiceStatus.Prepayment,
//           paid: () => `paid + ${money}`,
//           debt: 0,
//         })
//         .returning('*')
//         .execute()
//       if (invoiceUpdateResult.affected !== 1) {
//         throw new Error(`PayDebt failed: InvoiceId:${invoiceId} update failed`)
//       }
//       const invoice = Invoice.fromRaw(invoiceUpdateResult.raw[0])

//       // prepayment có thê thanh toán 0 đồng mục đích chỉ để chuyển trạng thái
//       // Nếu thanh toán = 0 thì ko lưu lịch sử
//       if (money > 0) {
//         // === 2. GET CUSTOMER ===
//         const customer = await manager.findOneBy(Customer, {
//           oid,
//           id: invoice.customerId,
//         })
//         const customerCloseDebt = customer.debt
//         const customerOpenDebt = customer.debt

//         // === 3. INSERT CUSTOMER_PAYMENT ===
//         const customerPaymentInsert: CustomerPaymentInsertType = {
//           oid,
//           customerId: invoice.customerId,
//           ticketId: invoiceId,
//           voucherType: VoucherType.Order,
//           createdAt: time,
//           paymentType: PaymentType.Prepayment,
//           paid: money,
//           debit: 0, // prepayment không phát sinh nợ
//           openDebt: customerOpenDebt,
//           closeDebt: customerCloseDebt,
//           note: '',
//           description: '',
//         }
//         const customerPaymentInsertResult = await manager.insert(
//           CustomerPayment,
//           customerPaymentInsert
//         )
//         const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
//         if (!customerPaymentId) {
//           throw new Error(
//             `Create CustomerPayment failed: ` +
//               `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
//           )
//         }
//       }

//       return { invoiceBasic: invoice }
//     })

//     return transaction
//   }
// }
