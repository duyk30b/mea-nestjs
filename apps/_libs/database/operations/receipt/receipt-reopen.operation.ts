import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Distributor } from '../../entities'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { PaymentPersonType } from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class ReceiptReopenOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private distributorManager: DistributorManager
  ) { }

  // Hàm này mục đích để quay về tạo thành 1 trường hợp chưa thanh toán
  async reopen(params: {
    oid: number
    userId: number
    receiptId: number
    time: number
    note: string
  }) {
    const { oid, userId, receiptId, time, note } = params

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. RECEIPT: update ===
      const receiptModified = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        { oid, id: receiptId },
        { endedAt: null, status: ReceiptStatus.Executing }
      )

      const paymentItemCreatedList = []
      let distributorModified: Distributor
      if (receiptModified.debt > 0) {
        const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receiptModified.distributorId },
          { debt: () => `debt - ${receiptModified.debt}` }
        )

        const distributorCloseDebt = distributorModified.debt
        const distributorOpenDebt = distributorCloseDebt + receiptModified.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const paymentItemInsert: PaymentItemInsertType = {
          oid,
          paymentId: 0,
          paymentPersonType: PaymentPersonType.Distributor,
          personId: receiptModified.distributorId,
          createdAt: time,

          voucherType: PaymentVoucherType.Receipt,
          voucherId: receiptId,
          voucherItemType: PaymentVoucherItemType.Other,
          voucherItemId: 0,
          paymentInteractId: 0,

          paidAmount: 0,
          debtAmount: -receiptModified.debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          cashierId: userId,
          note: note || '',
        }
        const paymentItemCreated = await this.paymentItemManager.insertOneAndReturnEntity(
          manager,
          paymentItemInsert
        )
        paymentItemCreatedList.push(paymentItemCreated)
      }

      return { receiptModified, paymentItemCreatedList, distributorModified }
    })

    return transaction
  }
}
