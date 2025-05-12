import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, PaymentManager } from '../../managers'

@Injectable()
export class DistributorPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager
  ) { }

  async startPayment(options: {
    oid: number
    distributorId: number
    paymentMethodId: number
    money: number
    time: number
    cashierId: number
    receiptPaymentList: { receiptId: number; money: number }[]
    note?: string
  }) {
    const {
      oid,
      distributorId,
      paymentMethodId,
      receiptPaymentList,
      money,
      time,
      note,
      cashierId,
    } = options
    const PREFIX = `distributorId=${distributorId} payment failed`

    const totalReceiptMoney = receiptPaymentList.reduce((acc, cur) => {
      if (cur.money <= 0) {
        throw new Error(`${PREFIX}: Money number invalid`)
      }
      return acc + cur.money
    }, 0)
    const moneyRemain = money - totalReceiptMoney

    if (totalReceiptMoney < 0 || money <= 0 || money < totalReceiptMoney) {
      throw new Error(`${PREFIX}: Money number invalid`)
    }
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt - ${money}` }
      )

      const distributorCloseDebt = distributorModified.debt
      let distributorOpenDebt = distributorCloseDebt + money

      const paymentInsertList: PaymentInsertType[] = []
      let description = ``
      if (receiptPaymentList.length) {
        description =
          `Thanh toán ${formatNumber(money)} vào các phiếu nợ::`
          + `${receiptPaymentList.map((i) => i.receiptId + '').join(',')}`
      }
      if (moneyRemain > 0) {
        description += ` - Cộng quỹ`
      }
      // === 3. UPDATE VISIT ===
      if (receiptPaymentList.length) {
        const receiptUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Receipt" receipt
          SET "paid"            = receipt."paid" + temp."money",
              "debt"            = receipt."debt" - temp."money",
              "status"          = CASE 
                                    WHEN(receipt."debt" = temp."money") 
                                        THEN ${ReceiptStatus.Completed} 
                                    ELSE ${ReceiptStatus.Debt}
                                  END
          FROM (VALUES `
          + receiptPaymentList.map((i) => `(${i.receiptId}, ${i.money})`).join(', ')
          + `   ) AS temp("receiptId", "money")
          WHERE   receipt."oid"           = ${oid} 
              AND receipt."id"            = temp."receiptId" 
              AND receipt."distributorId" = ${distributorId}
              AND receipt."status"        = ${ReceiptStatus.Debt}
              AND receipt."debt"         >= temp."money";
          `
        )
        if (receiptUpdateResult[1] != receiptPaymentList.length) {
          throw new Error(`${PREFIX}: Update Receipt failed, affected = ${receiptUpdateResult[1]}`)
        }

        receiptPaymentList.forEach((i) => {
          const paymentInsert: PaymentInsertType = {
            oid,
            paymentMethodId,
            voucherType: VoucherType.Receipt,
            voucherId: i.receiptId,
            personType: PersonType.Distributor,
            personId: distributorId,
            paymentTiming: PaymentTiming.PayDebt,
            createdAt: time,
            moneyDirection: MoneyDirection.Out,
            paidAmount: -i.money,
            debtAmount: -i.money,
            openDebt: distributorOpenDebt,
            closeDebt: distributorOpenDebt - i.money,
            cashierId,
            note: note || '',
            description,
          }
          distributorOpenDebt = paymentInsert.closeDebt
          paymentInsertList.push(paymentInsert)
        })
      }

      if (moneyRemain > 0) {
        const paymentInsert: PaymentInsertType = {
          oid,
          paymentMethodId,
          voucherType: VoucherType.Unknown,
          voucherId: 0,
          personType: PersonType.Distributor,
          personId: distributorId,
          paymentTiming: PaymentTiming.TopUp,
          createdAt: time,
          moneyDirection: MoneyDirection.Out,
          paidAmount: -moneyRemain,
          debtAmount: -moneyRemain,
          openDebt: distributorOpenDebt,
          closeDebt: distributorOpenDebt - moneyRemain,
          cashierId,
          note: note || '',
          description,
        }
        paymentInsertList.push(paymentInsert)
      }

      const paymentCreatedList = await this.paymentManager.insertManyAndReturnEntity(
        manager,
        paymentInsertList
      )

      return { distributor: distributorModified }
    })
  }
}
