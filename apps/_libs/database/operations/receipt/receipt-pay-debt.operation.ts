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
export class ReceiptPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager
  ) { }

  async payDebt(params: {
    oid: number
    cashierId: number
    receiptId: number
    paymentMethodId: number
    time: number
    money: number
  }) {
    const { oid, cashierId, receiptId, time, money, paymentMethodId } = params
    const PREFIX = `ReceiptId=${receiptId} pay debt failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money=${money}`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const receipt = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        { oid, id: receiptId, status: { IN: [ReceiptStatus.Debt] } },
        {
          status: () => `CASE 
                            WHEN("totalMoney" - paid = ${money}) THEN ${ReceiptStatus.Completed} 
                            ELSE ${ReceiptStatus.Debt}
                            END
                        `,
          debt: () => `debt - ${money}`,
          paid: () => `paid + ${money}`,
        }
      )
      if (receipt.paid > receipt.totalMoney) {
        throw new Error('Số tiền thanh toán nhiều hơn số tiền cần phải trả')
      }

      // === 2. UPDATE DISTRIBUTOR ===
      const distributor = await this.distributorManager.updateOneAndReturnEntity(
        manager,
        { oid, id: receipt.distributorId },
        { debt: () => `debt - ${money}` }
      )
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt + money

      // === 3. INSERT DISTRIBUTOR_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        cashierId,
        paymentMethodId,
        voucherType: VoucherType.Receipt,
        voucherId: receiptId,
        personType: PersonType.Distributor,
        personId: receipt.distributorId,
        createdAt: time,

        paymentTiming: PaymentTiming.PayDebt,
        moneyDirection: MoneyDirection.Out,
        paidAmount: -money,
        debtAmount: -money,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
        note: '',
        description: '',
      }
      const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

      return { distributor, receipt, payment }
    })

    return transaction
  }
}
