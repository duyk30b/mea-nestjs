import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
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
export class DistributorPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private receiptManager: ReceiptManager
  ) { }

  async startPayDebt(options: {
    oid: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
    dataList: { receiptId: number; paidAmount: number }[]
  }) {
    const { oid, distributorId, cashierId, paymentMethodId, time, paidAmount, note, dataList } =
      options

    const paidAmountReduce = dataList.reduce((acc, item) => acc + item.paidAmount, 0)
    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const receiptModifiedList = await this.receiptManager.bulkUpdate({
        manager,
        tempList: dataList.map((i) => ({
          id: i.receiptId,
          paidAmount: i.paidAmount,
        })),
        condition: {
          oid,
          status: ReceiptStatus.Debt,
          distributorId,
          debt: { RAW_QUERY: '"debt" >= temp."paidAmount"' },
        },
        compare: ['id'],
        update: {
          paid: (t) => `paid + "${t}"."paidAmount"`,
          debt: (t) => `debt - "${t}"."paidAmount"`,
          status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = "${t}"."paidAmount") THEN ${ReceiptStatus.Completed} 
                                    ELSE ${ReceiptStatus.Debt}
                                  END`,
        },
        options: { requireEqualLength: true },
      })

      const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt - ${paidAmount}` }
      )
      const distributorCloseDebt = distributorModified.debt
      const distributorOpenDebt = distributorModified.debt + paidAmount

      const paymentInsertList = receiptModifiedList.map((receiptModified) => {
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Receipt,
          voucherId: receiptModified.id,
          personType: PaymentPersonType.Distributor,
          personId: receiptModified.distributorId,

          createdAt: time,
          paymentMethodId,
          cashierId,
          moneyDirection: MoneyDirection.Out,
          note: note || '',

          paidAmount,
          paymentActionType: PaymentActionType.PayDebt,
          debtAmount: -paidAmount,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
        }
        return paymentInsert
      })
      const paymentCreatedList = await this.paymentManager.insertManyAndReturnEntity(
        manager,
        paymentInsertList
      )

      return { receiptModifiedList, distributorModified, paymentCreatedList }
    })

    return transaction
  }
}
