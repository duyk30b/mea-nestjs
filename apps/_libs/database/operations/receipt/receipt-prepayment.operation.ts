import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Distributor } from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { PaymentManager, ReceiptManager } from '../../managers'

@Injectable()
export class ReceiptPrepaymentOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private paymentManager: PaymentManager
  ) { }

  async prepayment(params: {
    oid: number
    cashierId: number
    receiptId: number
    paymentMethodId: number
    time: number
    money: number
  }) {
    const { oid, cashierId, receiptId, paymentMethodId, time, money } = params
    if (money < 0) {
      throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const receipt = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Executing] },
        },
        {
          status: () => `CASE 
                              WHEN(status = ${ReceiptStatus.Draft}) THEN ${ReceiptStatus.Deposited} 
                              ELSE status
                          END
                          `,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
        }
      )

      // Prepayment có thê thanh toán 0 đồng mục đích chỉ để chuyển trạng thái
      let payment: Payment
      if (money > 0) {
        // === 2. GET DISTRIBUTOR ===
        const distributor = await manager.findOneBy(Distributor, {
          oid,
          id: receipt.distributorId,
        })
        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt

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

          paymentTiming: PaymentTiming.Prepayment,
          moneyDirection: MoneyDirection.Out,
          paidAmount: -money,
          debtAmount: 0, // prepayment không phát sinh nợ
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: '',
        }
        payment = await this.paymentManager.insertOneAndReturnEntity(manager, paymentInsert)
      }

      return { receipt, payment }
    })

    return transaction
  }
}
