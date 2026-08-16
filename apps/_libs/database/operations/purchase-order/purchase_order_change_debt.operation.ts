import { BusinessError } from '@libs/database/common/error'
import { PurchaseOrderActionType } from '@libs/database/common/variable'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
} from '@libs/database/entities/payment.entity'
import { PaymentPurchaseOrderInsertType } from '@libs/database/entities/payment_purchase_order.entity'
import { PurchaseOrderStatus } from '@libs/database/entities/purchase-order.entity'
import {
  DistributorRepository,
  PaymentPurchaseOrderRepository,
  PaymentRepository,
  PurchaseOrderRepository,
  WalletRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class PurchaseOrderChangeDebtOperation {
  constructor(
    private dataSource: DataSource,
    private distributorRepository: DistributorRepository,
    private walletRepository: WalletRepository,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private paymentRepository: PaymentRepository,
    private paymentPurchaseOrderRepository: PaymentPurchaseOrderRepository
  ) {}

  async startChangeDebt(props: {
    oid: number
    distributorId: number
    paymentActionType: PaymentActionType
    purchaseOrderActionType: PurchaseOrderActionType
    changeDebtList: { purchaseOrderId: string; paid: number; debt: number }[]
    cashierId: number
    walletId: string
    time: number
    note: string
  }) {
    // Chỉ 1 trong 2 trường hợp được phép xảy ra: (debt luôn != 0)
    // Nếu paid + debt = 0 => thanh toán nợ
    // Nếu paid = 0 => điều chỉnh nợ (ví dụ đóng phiếu, mở lại phiếu)
    const {
      oid,
      distributorId,
      cashierId,
      walletId,
      time,
      note,
      paymentActionType,
      purchaseOrderActionType,
      changeDebtList,
    } = props
    const PREFIX = `distributorId=${distributorId} change debt failed`

    const paidTotal = changeDebtList.reduce((acc, cur) => {
      if (cur.paid != 0 && cur.debt + cur.paid != 0) {
        throw new Error(`${PREFIX}: Paid number invalid`)
      }
      return acc + cur.paid
    }, 0)
    const debtTotal = changeDebtList.reduce((acc, cur) => {
      if (cur.debt == 0) {
        throw new Error(`${PREFIX}: Debt number must not be 0`)
      }
      return acc + cur.debt
    }, 0)

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const distributorModified = await this.distributorRepository.managerUpdateOne(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt + ${debtTotal}` }
      )

      const distributorCloseDebt = distributorModified.debt
      const distributorOpenDebt = distributorCloseDebt - debtTotal

      let walletOpenMoney = 0
      let walletCloseMoney = 0
      if (paidTotal != 0) {
        if (walletId && walletId !== '0') {
          const walletModified = await this.walletRepository.managerUpdateOne(
            manager,
            { oid, id: walletId },
            { money: () => `money - ${paidTotal}` }
          )
          walletCloseMoney = walletModified.money
          walletOpenMoney = walletModified.money + paidTotal
        } else {
          // validate wallet
          const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
          if (walletList.length) {
            throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
          }
        }
      }

      const purchaseOrderModifiedList = await this.purchaseOrderRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          distributorId,
          status: { NOT_IN: [PurchaseOrderStatus.Completed, PurchaseOrderStatus.Cancelled] },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: changeDebtList.map((i) => ({
          id: i.purchaseOrderId,
          paid: i.paid,
          debt: i.debt,
        })),
        update: {
          paid: (t: string, u: string) => `"${u}"."paid" + "${t}"."paid"`,
          debt: (t: string, u: string) => `"${u}"."debt" + "${t}"."debt"`,
          status: (t: string, u: string) => `CASE 
                WHEN("status" = ${PurchaseOrderStatus.Debt} 
                    AND "${u}"."debt" + "${t}"."debt" = 0 
                    AND "${u}"."paid" + "${t}"."paid" = "${u}"."totalMoney") 
                  THEN ${PurchaseOrderStatus.Completed}
                ELSE "status"
              END`,
        },
        options: { requireEqualLength: true },
      })

      purchaseOrderModifiedList.forEach((purchaseOrderModified) => {
        if (
          purchaseOrderModified.debt < 0
          || purchaseOrderModified.debt > purchaseOrderModified.totalMoney
        ) {
          throw new BusinessError(PREFIX, 'Số tiền nợ không đúng', {
            purchaseOrderId: purchaseOrderModified.id,
          })
        }
      })

      const paymentInsert: PaymentInsertType = {
        oid,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        cashierId,
        walletId: walletId || '0',
        paymentActionType,
        moneyDirection: paidTotal > 0 ? MoneyDirection.Out : MoneyDirection.In,
        note,
        createdAt: time,

        paidTotal: -paidTotal,
        debtTotal,
        personOpenDebt: distributorOpenDebt,
        personCloseDebt: distributorCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      }
      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

      const paymentPurchaseOrderInsertList = changeDebtList.map((i) => {
        const inserter: PaymentPurchaseOrderInsertType = {
          oid,
          paymentId: paymentCreated.id,
          purchaseOrderId: i.purchaseOrderId,
          purchaseOrderActionType,
          paidMoney: -i.paid,
          debtMoney: i.debt,
          createdAt: time,
        }
        return inserter
      })

      const paymentPurchaseOrderCreatedList =
        await this.paymentPurchaseOrderRepository.managerInsertMany(
          manager,
          paymentPurchaseOrderInsertList
        )

      paymentPurchaseOrderCreatedList.forEach((i) => {
        i.payment = paymentCreated
      })

      return {
        distributorModified,
        purchaseOrderModifiedList,
        paymentPurchaseOrderCreatedList,
      }
    })

    return transaction
  }
}
