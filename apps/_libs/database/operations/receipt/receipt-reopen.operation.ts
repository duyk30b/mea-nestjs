import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Distributor } from '../../entities'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentManager } from '../../repositories'

@Injectable()
export class ReceiptReopenOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private paymentManager: PaymentManager,
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

      const paymentCreatedList = []
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
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Receipt,
          voucherId: receiptId,
          personType: PaymentPersonType.Distributor,
          personId: receiptModified.distributorId,

          cashierId: userId,
          paymentMethodId: 0,
          createdAt: time,
          paymentActionType: PaymentActionType.Reopen,
          moneyDirection: MoneyDirection.Other,
          note: note || '',

          paidAmount: 0,
          debtAmount: -receiptModified.debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )
        paymentCreatedList.push(paymentCreated)
      }

      return { receiptModified, paymentCreatedList, distributorModified }
    })

    return transaction
  }
}
