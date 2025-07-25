import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { MoneyDirection, PaymentInsertType, PaymentPersonType } from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class DistributorRefundOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private receiptManager: ReceiptManager
  ) { }

  async startRefund(options: {
    oid: number
    distributorId: number
    paymentMethodId: number
    cashierId: number
    receiptId: number
    time: number
    money: number
    reason: string
    note: string
  }) {
    const { oid, paymentMethodId, distributorId, receiptId, time, cashierId, money, reason, note } =
      options

    if (money <= 0) {
      throw new BusinessError('Số tiền hoàn trả không hợp lệ', { money })
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const receiptModified = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          status: { IN: [ReceiptStatus.Deposited, ReceiptStatus.Executing] },
        },
        {
          paid: () => `paid - ${money}`,
          debt: () => `debt + ${money}`,
        }
      )
      if (receiptModified.paid < 0) {
        throw new BusinessError(`Số tiền hoàn trả vượt quá số tiền cho phép`, {
          money,
          paidOrigin: receiptModified.paid + money,
        })
      }

      // === 2. CUSTOMER: query ===
      const distributor = await this.distributorManager.findOneBy(manager, {
        oid,
        id: receiptModified.distributorId,
      })
      if (!distributor) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        paymentPersonType: PaymentPersonType.Distributor,
        personId: distributorId,
        createdAt: time,
        moneyDirection: MoneyDirection.In,
        money,
        cashierId,
        note: note || '',
        reason: reason || '',
      }

      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      const paymentItemInsert: PaymentItemInsertType = {
        oid,
        paymentId: paymentCreated.id,
        personId: distributorId,
        paymentPersonType: PaymentPersonType.Distributor,

        voucherType: PaymentVoucherType.Receipt,
        voucherId: receiptId,
        voucherItemType: PaymentVoucherItemType.Other,
        voucherItemId: 0,
        paymentInteractId: 0,

        note: note || 'Hoàn trả',
        createdAt: time,
        cashierId,

        expectedPrice: -money,
        actualPrice: -money,
        quantity: 1,
        discountMoney: 0,
        discountPercent: 0,
        paidAmount: -money,
        debtAmount: 0,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
      }

      const paymentItemCreated = await this.paymentItemManager.insertOneAndReturnEntity(
        manager,
        paymentItemInsert
      )

      return { receiptModified, paymentCreated, paymentItemCreated, distributor }
    })
    return transaction
  }
}
