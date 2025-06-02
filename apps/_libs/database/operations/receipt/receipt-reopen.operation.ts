import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Distributor } from '../../entities'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, PaymentManager, ReceiptManager } from '../../managers'

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
    cashierId: number
    receiptId: number
    paymentMethodId: number
    time: number
    newPaid: number
    note: string
    description: string
  }) {
    const { oid, cashierId, receiptId, time, paymentMethodId, newPaid, note, description } = params
    const PREFIX = `ReceiptId=${receiptId} refund money failed`
    if (newPaid < 0) {
      throw new Error(`${PREFIX} newPaid number invalid`)
    }

    try {
      const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
        // === 1. RECEIPT: update ===
        const receiptOrigin = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receiptId },
          { endedAt: null }
        )

        const receiptModified = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          {
            oid,
            id: receiptId,
            status: { IN: [ReceiptStatus.Debt, ReceiptStatus.Completed] },
          },
          {
            paid: newPaid,
            debt: () => `"totalMoney" - ${newPaid}`,
            status: ReceiptStatus.Executing,
          }
        )

        if (receiptOrigin.paid === receiptModified.paid && receiptOrigin.debt === 0) {
          return { receipt: receiptModified } // truờng hợp này thì chả thanh toán gì
        }

        // === 2. CUSTOMER: query ===
        let distributor: Distributor
        if (receiptOrigin.debt > 0) {
          distributor = await this.distributorManager.updateOneAndReturnEntity(
            manager,
            { oid, id: receiptOrigin.distributorId },
            { debt: () => `debt - ${receiptOrigin.debt}` }
          )
        } else {
          distributor = await this.distributorManager.findOneBy(manager, {
            oid,
            id: receiptOrigin.distributorId,
          })
        }

        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt - receiptOrigin.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const paymentInsert: PaymentInsertType = {
          oid,
          cashierId,
          paymentMethodId,
          voucherType: VoucherType.Receipt,
          voucherId: receiptId,
          personType: PersonType.Distributor,
          personId: receiptOrigin.distributorId,
          createdAt: time,

          paymentTiming: PaymentTiming.Reopen,
          moneyDirection: MoneyDirection.In, //
          paidAmount: -(receiptModified.paid - receiptOrigin.paid), // cần thanh toán thêm số tiền mới, nếu để 0 tương đương nhận lại hết tiền
          debtAmount: -receiptOrigin.debt, // return hủy tất cả nợ trước đó
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note,
          description,
        }
        const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

        return { receipt: receiptModified, distributor, payment }
      })

      return transaction
    } catch (error) {
      throw error
    }
  }
}
