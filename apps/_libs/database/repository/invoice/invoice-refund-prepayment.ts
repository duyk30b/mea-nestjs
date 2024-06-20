import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { InvoiceStatus, PaymentType, VoucherType } from '../../common/variable'
import { Customer, CustomerPayment, Invoice } from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'

@Injectable()
export class InvoiceRefundPrepayment {
  constructor(private dataSource: DataSource) {}

  async refundPrepayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
    const { oid, invoiceId, time, money } = params
    const PREFIX = `InvoiceId=${invoiceId} refund money failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. INVOICE: update ===
      const whereInvoice: FindOptionsWhere<Invoice> = {
        oid,
        id: invoiceId,
        status: InvoiceStatus.Prepayment,
        debt: 0,
      }
      const invoiceUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Invoice)
        .where(whereInvoice)
        .set({
          status: () => `CASE 
                            WHEN("paid" = ${money}) THEN ${InvoiceStatus.Draft} 
                            ELSE ${InvoiceStatus.Prepayment}
                            END
                        `,
          paid: () => `paid - ${money}`,
        })
        .returning('*')
        .execute()
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update invoice failed`)
      }
      const invoice = Invoice.fromRaw(invoiceUpdateResult.raw[0])

      // *** RETURN ***. Nếu hoàn trả tiền mà ko có tiền thì chỉ cập nhật status là đủ ***
      if (money == 0) return

      // === 2. CUSTOMER: query ===
      const customer = await manager.findOneBy(Customer, {
        oid,
        id: invoice.customerId,
      })
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentDraft: CustomerPaymentInsertType = {
        oid,
        customerId: invoice.customerId,
        voucherId: invoiceId,
        voucherType: VoucherType.Invoice,
        createdAt: time,
        paymentType: PaymentType.ReceiveRefund,
        paid: -money,
        debit: 0, // refund prepayment không phát sinh nợ
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }
      const customerPaymentInsertResult = await manager.insert(
        CustomerPayment,
        customerPaymentDraft
      )
      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `Create CustomerPayment failed: ` +
            `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }

      return { invoiceBasic: invoice }
    })

    return transaction
  }
}
