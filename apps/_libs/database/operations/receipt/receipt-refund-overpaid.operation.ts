import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
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
export class ReceiptRefundOverpaidOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private paymentManager: PaymentManager,
    private distributorManager: DistributorManager
  ) { }

  async refundOverpaid(params: {
    oid: number
    cashierId: number
    receiptId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
    description: string
  }) {
    const { oid, cashierId, receiptId, time, paymentMethodId, money, note, description } = params
    const PREFIX = `ReceiptId=${receiptId} refund money failed`
    if (money < 0) {
      throw new Error(`${PREFIX} Money number invalid`)
    }

    try {
      const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
        // === 1. RECEIPT: update ===
        const receipt = await this.receiptManager.updateOneAndReturnEntity(
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

        if (receipt.paid < 0) {
          throw new Error('Số tiền hoàn trả quá lớn')
        }

        // === 2. CUSTOMER: query ===
        const distributor = await this.distributorManager.findOneBy(manager, {
          oid,
          id: receipt.distributorId,
        })
        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const paymentInsert: PaymentInsertType = {
          oid,
          cashierId,
          paymentMethodId,
          voucherType: VoucherType.Receipt,
          voucherId: receiptId,
          personType: PersonType.Distributor,
          personId: receipt.distributorId,

          paymentTiming: PaymentTiming.ReceiveRefund,
          createdAt: time,
          moneyDirection: MoneyDirection.In,
          paidAmount: money,
          debtAmount: 0, // refund prepayment không phát sinh nợ
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note,
          description,
        }
        const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

        return { receipt, distributor, payment }
      })

      return transaction
    } catch (error) {
      throw error
    }
  }
}
