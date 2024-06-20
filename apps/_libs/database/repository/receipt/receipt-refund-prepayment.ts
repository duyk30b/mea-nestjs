import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { PaymentType, ReceiptStatus, VoucherType } from '../../common/variable'
import { Distributor, DistributorPayment, Receipt } from '../../entities'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'

@Injectable()
export class ReceiptRefundPrepayment {
  constructor(private dataSource: DataSource) {}

  async refundPrepayment(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    const PREFIX = `ReceiptId=${receiptId} refund money failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. INVOICE: update ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: ReceiptStatus.Prepayment,
        debt: 0,
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set({
          status: () => `CASE 
                            WHEN("paid" = ${money}) THEN ${ReceiptStatus.Draft} 
                            ELSE ${ReceiptStatus.Prepayment}
                            END
                        `,
          paid: () => `paid - ${money}`,
        })
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update receipt failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // *** RETURN ***. Nếu hoàn trả tiền mà ko có tiền thì chỉ cập nhật status là đủ ***
      if (money == 0) return

      // === 2. CUSTOMER: query ===
      const distributor = await manager.findOneBy(Distributor, {
        oid,
        id: receipt.distributorId,
      })
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const distributorPaymentDraft: DistributorPaymentInsertType = {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        paymentType: PaymentType.ReceiveRefund,
        paid: -money,
        debit: 0, // refund prepayment không phát sinh nợ
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
        note: '',
        description: '',
      }
      const distributorPaymentInsertResult = await manager.insert(
        DistributorPayment,
        distributorPaymentDraft
      )
      const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
      if (!distributorPaymentId) {
        throw new Error(
          `Create DistributorPayment failed: ` +
            `Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
        )
      }

      return { receiptBasic: receipt }
    })

    return transaction
  }
}
