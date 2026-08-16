import { DeliveryStatus, PurchaseOrderActionType } from '@libs/database/common/variable'
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
import { BusinessError } from '../../common/error'

@Injectable()
export class PurchaseOrderChangePaidOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private walletRepository: WalletRepository,
    private distributorRepository: DistributorRepository,
    private paymentRepository: PaymentRepository,
    private paymentPurchaseOrderRepository: PaymentPurchaseOrderRepository
  ) {}

  async startPaymentMoney(props: {
    oid: number
    purchaseOrderId: string
    cashierId: number
    walletId: string
    paymentActionType: PaymentActionType
    purchaseOrderActionType: PurchaseOrderActionType
    paidTotal: number
    time: number
    note: string
  }) {
    const {
      oid,
      cashierId,
      paymentActionType,
      time,
      note,
      purchaseOrderId,
      purchaseOrderActionType,
      paidTotal,
    } = props
    const walletId = props.walletId || '0'
    const PREFIX = `purchaseOrderId=${purchaseOrderId} startPayment failed: `

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: {
            IN: [
              PurchaseOrderStatus.Draft,
              PurchaseOrderStatus.Schedule,
              PurchaseOrderStatus.Executing,
            ],
          },
        },
        {
          paid: () => `paid + ${paidTotal}`,
          status: () => ` CASE
                      WHEN("status" = ${PurchaseOrderStatus.Draft}) THEN ${PurchaseOrderStatus.Schedule} 
                      ELSE "status"
                  END`,
        }
      )

      const { distributorId } = purchaseOrderModified

      const distributorModified = await this.distributorRepository.managerFindOneBy(manager, {
        oid,
        id: distributorId,
      })
      const distributorOpenDebt = distributorModified.debt
      const distributorCloseDebt = distributorModified.debt
      let walletOpenMoney = 0
      let walletCloseMoney = 0

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

      let moneyDirection = MoneyDirection.Other
      if (paidTotal > 0) {
        moneyDirection = MoneyDirection.Out
      }
      if (paidTotal < 0) {
        moneyDirection = MoneyDirection.In
      }

      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, {
        oid,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        cashierId,
        walletId,
        paymentActionType,
        moneyDirection,
        note,
        createdAt: time,

        paidTotal: -paidTotal, // với phiếu nhập thì thanh toán bị tính ngược lại
        debtTotal: 0,
        personOpenDebt: distributorOpenDebt,
        personCloseDebt: distributorCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      } satisfies PaymentInsertType)

      const paymentPurchaseOrderCreated =
        await this.paymentPurchaseOrderRepository.managerInsertOne(manager, {
          oid,
          paymentId: paymentCreated.id,
          purchaseOrderId,
          paidMoney: -paidTotal,
          debtMoney: 0,
          purchaseOrderActionType,
          createdAt: time,
        } satisfies PaymentPurchaseOrderInsertType)

      paymentPurchaseOrderCreated.payment = paymentCreated

      return {
        purchaseOrderModified,
        distributorModified,
        paymentPurchaseOrderCreated,
      }
    })

    return transaction
  }
}
