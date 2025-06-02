import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../common/variable'
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
export class ReceiptPaymentAndCloseOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager
  ) { }

  async paymentAndClose(params: {
    oid: number
    cashierId: number
    receiptId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
    description: string
  }) {
    const { oid, cashierId, receiptId, paymentMethodId, time, money, note, description } = params
    const PREFIX = `ReceiptId=${receiptId} ship and payment failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const receipt = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Delivered] },
          status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Executing] },
        },
        {
          status: () => `CASE 
                              WHEN(paid + ${money} > "totalMoney") THEN ${ReceiptStatus.Executing} 
                              WHEN(paid + ${money} < "totalMoney") THEN ${ReceiptStatus.Debt} 
                              ELSE ${ReceiptStatus.Completed}
                          END
                          `,
          debt: () => `"totalMoney" - paid - ${money}`,
          paid: () => `paid + ${money}`,
          endedAt: time,
        }
      )

      if (receipt.debt == 0 && money == 0) {
        return { receipt } // không ghi nợ, cũng không ghi thanh toán
      }
      // === 3. CUSTOMER + CUSTOMER_PAYMENT ===

      if ([ReceiptStatus.Executing, ReceiptStatus.Completed].includes(receipt.status)) {
        // trường hợp này không ghi nợ
        const distributor = await this.distributorManager.findOneBy(manager, {
          oid,
          id: receipt.distributorId,
        })
        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }

        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributorCloseDebt

        const paymentInsert: PaymentInsertType = {
          oid,
          cashierId,
          paymentMethodId,
          voucherType: VoucherType.Receipt,
          voucherId: receiptId,
          personType: PersonType.Distributor,
          personId: receipt.distributorId,
          createdAt: time,

          paymentTiming: PaymentTiming.Close,
          moneyDirection: MoneyDirection.Out,
          paidAmount: -money,
          debtAmount: 0,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note,
          description,
        }
        const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

        return { receipt, distributor, payment }
      }

      if ([ReceiptStatus.Debt].includes(receipt.status)) {
        // trường hợp này phải ghi nợ
        const distributor = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receipt.distributorId },
          { debt: () => `debt + ${receipt.debt}` }
        )
        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }

        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributorCloseDebt - receipt.debt

        const paymentInsert: PaymentInsertType = {
          oid,
          cashierId,
          paymentMethodId,
          voucherType: VoucherType.Receipt,
          voucherId: receiptId,
          personType: PersonType.Distributor,
          personId: receipt.distributorId,
          createdAt: time,

          paymentTiming: PaymentTiming.Close,
          moneyDirection: MoneyDirection.Out,
          paidAmount: -money,
          debtAmount: receipt.debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: '',
        }
        const payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)

        return { receipt, distributor, payment }
      }
    })

    return transaction
  }
}
