import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../common/variable'
import { Distributor } from '../../entities'
import PaymentItem, {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { PaymentPersonType } from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentItemManager } from '../../repositories'

@Injectable()
export class ReceiptCloseOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private distributorManager: DistributorManager,
    private paymentItemManager: PaymentItemManager
  ) { }

  async startClose(params: {
    oid: number
    userId: number
    receiptId: number
    time: number
    note: string
  }) {
    const { oid, userId, receiptId, time, note } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. RECEIPT: update ===
      const receiptUpdated = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Delivered] },
          status: { IN: [ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Executing] },
        },
        {
          status: () => `CASE 
                            WHEN(paid > "totalMoney") THEN ${ReceiptStatus.Executing} 
                            WHEN(paid < "totalMoney") THEN ${ReceiptStatus.Debt} 
                            ELSE ${ReceiptStatus.Completed}
                        END
                        `,
          endedAt: time,
        }
      )

      let newDebtReceipt = receiptUpdated.debt
      let distributorModified: Distributor
      const paymentItemCreatedList: PaymentItem[] = []

      if (receiptUpdated.debt > 0) {
        let paidByTopUp = 0
        const distributorOrigin = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receiptUpdated.distributorId, isActive: 1 },
          { isActive: 1 }
        )
        if (distributorOrigin.debt < 0) {
          const topUpMoney = -distributorOrigin.debt
          paidByTopUp = Math.min(receiptUpdated.debt, topUpMoney)
        }
        newDebtReceipt = receiptUpdated.debt - paidByTopUp
        const newDebtCustomer = distributorOrigin.debt + paidByTopUp + newDebtReceipt
        // const newDebtCustomer = distributorOrigin.debt + receiptModified.debt ==> tính đi tính lại thì nó vẫn thế này

        distributorModified = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receiptUpdated.distributorId },
          { debt: newDebtCustomer }
        )

        const paymentItemInsert: PaymentItemInsertType = {
          oid,
          paymentId: 0,
          paymentPersonType: PaymentPersonType.Distributor,
          personId: receiptUpdated.distributorId,
          createdAt: time,

          voucherType: PaymentVoucherType.Receipt,
          voucherId: receiptId,
          voucherItemType: PaymentVoucherItemType.Other,
          voucherItemId: 0,
          paymentInteractId: 0,

          paidAmount: 0,
          debtAmount: paidByTopUp + newDebtReceipt,
          openDebt: distributorOrigin.debt,
          closeDebt: distributorModified.debt,
          cashierId: userId,
          note: note || 'Đóng phiếu',
        }
        const paymentItemCreated = await this.paymentItemManager.insertOneAndReturnEntity(
          manager,
          paymentItemInsert
        )
        paymentItemCreatedList.push(paymentItemCreated)
      }

      let receiptModified = receiptUpdated
      if (receiptUpdated.debt !== newDebtReceipt) {
        receiptModified = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          { oid, id: receiptId },
          { debt: newDebtReceipt, paid: receiptUpdated.totalMoney - newDebtReceipt }
        )
      }

      return { receiptModified, paymentItemCreatedList, distributorModified }
    })

    return transaction
  }
}
