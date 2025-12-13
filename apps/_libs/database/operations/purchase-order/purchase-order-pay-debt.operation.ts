import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import { Distributor } from '../../entities'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import {
  DistributorRepository,
  PaymentRepository,
  PurchaseOrderRepository,
  WalletRepository,
} from '../../repositories'

@Injectable()
export class PurchaseOrderPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private distributorRepository: DistributorRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startPayDebt(props: {
    oid: number
    distributorId: number
    userId: number
    walletId: string
    time: number
    paidAmount: number
    note: string
    dataList: { purchaseOrderId: string; paidAmount: number }[]
  }) {
    const { oid, distributorId, userId, time, paidAmount, dataList } = props
    const walletId = props.walletId || '0'
    let note = props.note

    const paidAmountReduce = dataList.reduce((acc, item) => acc + item.paidAmount, 0)
    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const purchaseOrderModifiedList = await this.purchaseOrderRepository.managerBulkUpdate({
        manager,
        tempList: dataList.map((i) => ({
          id: i.purchaseOrderId,
          paidAmount: i.paidAmount,
        })),
        condition: {
          oid,
          status: { IN: [PurchaseOrderStatus.Executing, PurchaseOrderStatus.Debt] },
          distributorId,
          debt: { RAW_QUERY: '"debt" >= temp."paidAmount"' },
        },
        compare: { id: { cast: 'bigint' } },
        update: {
          paid: (t) => `paid + "${t}"."paidAmount"`,
          debt: (t) => `debt - "${t}"."paidAmount"`,
          status: (t: string, u: string) => ` CASE
                            WHEN("${u}"."status" = ${PurchaseOrderStatus.Debt} AND "${u}"."debt" = "${t}"."paidAmount") 
                                THEN ${PurchaseOrderStatus.Completed} 
                            ELSE "${u}"."status"
                          END`,
        },
        options: { requireEqualLength: true },
      })

      let walletOpenMoney = 0
      let distributorOpenDebt = 0
      let distributorModified: Distributor = null

      distributorModified = await this.distributorRepository.managerUpdateOne(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt - ${paidAmount}` }
      )
      distributorOpenDebt = distributorModified.debt + paidAmount

      if (!note && dataList.length > 1) {
        note = `Trả nợ ${paidAmount} vào ${dataList.length} phiếu`
      }

      if (walletId !== '0') {
        const walletModified = await this.walletRepository.managerUpdateOne(
          manager,
          { oid, id: walletId },
          { money: () => `money - ${paidAmount}` }
        )
        walletOpenMoney = walletModified.money + paidAmount
      } else {
        // validate wallet
        const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
        if (walletList.length) {
          throw new BusinessError('Chưa chọn phương thức thanh toán')
        }
      }

      const paymentInsertList = dataList.map((item) => {
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: item.purchaseOrderId,
          personType: PaymentPersonType.Distributor,
          personId: distributorId,

          createdAt: time,
          walletId,
          moneyDirection: MoneyDirection.Out,
          cashierId: userId,
          note: note || '',

          paymentActionType: PaymentActionType.PayDebt,
          paid: -item.paidAmount,
          paidItem: 0,
          debt: item.paidAmount,
          debtItem: 0,
          personOpenDebt: distributorOpenDebt,
          personCloseDebt: distributorOpenDebt - item.paidAmount,
          walletOpenMoney: walletId === '0' ? 0 : walletOpenMoney,
          walletCloseMoney: walletId === '0' ? 0 : walletOpenMoney - paidAmount,
        }
        distributorOpenDebt = paymentInsert.personCloseDebt
        walletOpenMoney = walletId === '0' ? 0 : paymentInsert.walletCloseMoney
        return paymentInsert
      })
      const paymentCreatedList = await this.paymentRepository.managerInsertMany(
        manager,
        paymentInsertList
      )

      return { purchaseOrderModifiedList, distributorModified, paymentCreatedList }
    })

    return transaction
  }
}
