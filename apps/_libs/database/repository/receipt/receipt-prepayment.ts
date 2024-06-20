import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, Raw, UpdateResult } from 'typeorm'
import { PaymentType, ReceiptStatus } from '../../common/variable'
import { Distributor, DistributorPayment, Receipt } from '../../entities'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'

@Injectable()
export class ReceiptPrepayment {
  constructor(private dataSource: DataSource) {}

  async prepayment(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    if (money < 0) {
      throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE RECEIPT ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Prepayment]),
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set({
          status: ReceiptStatus.Prepayment,
          paid: () => `paid + ${money}`,
          debt: 0, // thanh toán trước nên không tính là nợ
        })
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Receipt PayDebt failed: ReceiptId:${receiptId} update failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // Prepayment có thê thanh toán 0 đồng mục đích chỉ để chuyển trạng thái
      // Nếu thanh toán = 0 thì ko lưu lịch sử
      if (money > 0) {
        // === 2. GET DISTRIBUTOR ===
        const distributor = await manager.findOneBy(Distributor, {
          oid,
          id: receipt.distributorId,
        })
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt

        // === 3. INSERT DISTRIBUTOR_PAYMENT ===
        const distributorPaymentInsert: DistributorPaymentInsertType = {
          oid,
          distributorId: receipt.distributorId,
          receiptId,
          createdAt: time,
          paymentType: PaymentType.Prepayment,
          paid: money,
          debit: 0, // prepayment không phát sinh nợ
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: '',
        }
        const distributorPaymentInsertResult = await manager.insert(
          DistributorPayment,
          distributorPaymentInsert
        )
        const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
        if (!distributorPaymentId) {
          throw new Error(
            `Create DistributorPayment failed: Insert error ${JSON.stringify(
              distributorPaymentInsertResult
            )}`
          )
        }
      }

      return { receiptBasic: receipt }
    })

    return transaction
  }
}
