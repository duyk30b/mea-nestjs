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
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { DistributorManager, PaymentManager, PurchaseOrderManager } from '../../repositories'

@Injectable()
export class DistributorPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private purchaseOrderManager: PurchaseOrderManager
  ) { }

  async startPayDebt(options: {
    oid: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
    dataList: { purchaseOrderId: number; paidAmount: number }[]
  }) {
    const { oid, distributorId, cashierId, paymentMethodId, time, paidAmount, note, dataList } =
      options

    const paidAmountReduce = dataList.reduce((acc, item) => acc + item.paidAmount, 0)
    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const purchaseOrderModifiedList = await this.purchaseOrderManager.bulkUpdate({
        manager,
        tempList: dataList.map((i) => ({
          id: i.purchaseOrderId,
          paidAmount: i.paidAmount,
        })),
        condition: {
          oid,
          status: PurchaseOrderStatus.Debt,
          distributorId,
          debt: { RAW_QUERY: '"debt" >= temp."paidAmount"' },
        },
        compare: ['id'],
        update: {
          paid: (t) => `paid + "${t}"."paidAmount"`,
          debt: (t) => `debt - "${t}"."paidAmount"`,
          status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = "${t}"."paidAmount") THEN ${PurchaseOrderStatus.Completed} 
                                    ELSE ${PurchaseOrderStatus.Debt}
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

      const paymentInsertList = purchaseOrderModifiedList.map((purchaseOrderModified) => {
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: purchaseOrderModified.id,
          personType: PaymentPersonType.Distributor,
          personId: purchaseOrderModified.distributorId,

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

      return { purchaseOrderModifiedList, distributorModified, paymentCreatedList }
    })

    return transaction
  }
}
