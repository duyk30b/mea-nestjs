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
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentManager } from '../../repositories'

@Injectable()
export class DistributorPrepaymentMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private receiptManager: ReceiptManager
  ) { }

  async startPrePaymentMoney(options: {
    oid: number
    receiptId: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
  }) {
    const { oid, receiptId, distributorId, cashierId, paymentMethodId, time, paidAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const receiptModified = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: receiptId,
          distributorId,
          status: {
            IN: [
              ReceiptStatus.Draft,
              ReceiptStatus.Schedule,
              ReceiptStatus.Deposited,
              ReceiptStatus.Executing,
            ],
          },
        },
        {
          paid: () => `paid + ${paidAmount}`,
          debt: () => `debt - ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${ReceiptStatus.Draft}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Schedule}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Deposited}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Executing}) THEN ${ReceiptStatus.Executing} 
                              ELSE ${ReceiptStatus.Executing}
                          END`,
        }
      )

      const distributor = await this.distributorManager.findOneBy(manager, {
        oid,
        id: distributorId,
      })
      if (!distributor) {
        throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
      }

      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Receipt,
        voucherId: receiptModified.id,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.Out,
        note: note || '',

        paidAmount,
        paymentActionType: PaymentActionType.PrepaymentMoney,
        debtAmount: 0,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      return { receiptModified, paymentCreated, distributor }
    })

    return transaction
  }
}
