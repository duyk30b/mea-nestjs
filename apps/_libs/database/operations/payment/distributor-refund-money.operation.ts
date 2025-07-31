import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import {
  DistributorManager,
  ReceiptManager,
} from '../../managers'
import { PaymentManager } from '../../repositories'

@Injectable()
export class DistributorRefundMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private receiptManager: ReceiptManager

  ) { }

  async startRefundMoney(options: {
    oid: number
    receiptId: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    refundAmount: number
    note: string
  }) {
    const { oid, receiptId, distributorId, cashierId, paymentMethodId, time, refundAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const receiptModified = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          status: { IN: [ReceiptStatus.Deposited, ReceiptStatus.Executing] },
          paid: { GTE: refundAmount },
        },
        {
          paid: () => `paid - ${refundAmount}`,
          debt: () => `debt + ${refundAmount}`,
        }
      )

      // === 2. CUSTOMER: query ===
      const distributor = await this.distributorManager.findOneBy(manager, {
        oid,
        id: receiptModified.distributorId,
      })
      if (!distributor) {
        throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
      }
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Receipt,
        voucherId: receiptModified.id,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.In,
        paymentActionType: PaymentActionType.RefundMoney,
        note: note || '',

        paidAmount: refundAmount,
        debtAmount: 0,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      return { receiptModified, distributor, paymentCreated }
    })
    return transaction
  }
}
