import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
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

export type PurchaseOrderPaymentOperationPropType = {
  oid: number
  purchaseOrderId: string
  userId: number
  walletId: string
  paymentActionType: PaymentActionType
  paidTotal: number
  debtTotal: number
  time: number
  note: string
}

@Injectable()
export class PurchaseOrderPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private walletRepository: WalletRepository,
    private distributorRepository: DistributorRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async managerPaymentMoney(manager: EntityManager, props: PurchaseOrderPaymentOperationPropType) {
    const { oid, purchaseOrderId, userId, paymentActionType, paidTotal, debtTotal, time, note } =
      props
    const walletId = props.walletId || '0'
    const PREFIX = `purchaseOrderId=${purchaseOrderId} startPayment failed: `

    const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
      manager,
      {
        oid,
        id: purchaseOrderId,
        status: {
          IN: [
            PurchaseOrderStatus.Draft,
            PurchaseOrderStatus.Schedule,
            PurchaseOrderStatus.Deposited,
            PurchaseOrderStatus.Executing,
            PurchaseOrderStatus.Debt,
          ],
        },
      },
      {
        paid: () => `paid + ${paidTotal}`,
        debt: () => `debt + ${debtTotal}`,
        status: () => ` CASE
                              WHEN("status" = ${PurchaseOrderStatus.Draft}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Schedule}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Deposited}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Executing}) THEN ${PurchaseOrderStatus.Executing} 
                              WHEN("status" = ${PurchaseOrderStatus.Debt} AND "paid" + ${paidTotal} = "totalMoney") 
                                THEN ${PurchaseOrderStatus.Completed} 
                              WHEN("status" = ${PurchaseOrderStatus.Debt} AND "paid" + ${paidTotal} < "totalMoney") 
                                THEN ${PurchaseOrderStatus.Debt} 
                              ELSE "status"
                          END`,
      }
    )

    if (purchaseOrderModified.status === PurchaseOrderStatus.Debt) {
      if (purchaseOrderModified.paid >= purchaseOrderModified.totalMoney) {
        throw new BusinessError(PREFIX, 'Số tiền thanh toán không đúng')
      }
      if (
        purchaseOrderModified.paid + purchaseOrderModified.debt
        != purchaseOrderModified.totalMoney
      ) {
        throw new BusinessError(PREFIX, 'Số tiền nợ không đúng')
      }
    }
    if (purchaseOrderModified.debt < 0) {
      throw new BusinessError(PREFIX, 'Số tiền trả nợ không đúng')
    }

    const { distributorId } = purchaseOrderModified

    let distributorModified: Distributor
    let walletOpenMoney = 0
    let walletCloseMoney = 0
    let distributorOpenDebt = 0
    let distributorCloseDebt = 0

    if (debtTotal != 0) {
      distributorModified = await this.distributorRepository.managerUpdateOne(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt + ${debtTotal}` }
      )
      distributorOpenDebt = distributorModified.debt - debtTotal
      distributorCloseDebt = distributorModified.debt
    } else {
      distributorModified = await this.distributorRepository.managerFindOneBy(manager, {
        oid,
        id: distributorId,
      })
      if (!distributorModified) {
        throw new BusinessError(PREFIX, 'Không tìm thấy nhà cung cấp phù hợp')
      }
      distributorOpenDebt = distributorModified.debt
      distributorCloseDebt = distributorModified.debt
    }

    if (paidTotal) {
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

    let moneyDirection = MoneyDirection.Other
    if (paidTotal > 0) {
      moneyDirection = MoneyDirection.Out
    }
    if (paidTotal < 0) {
      moneyDirection = MoneyDirection.In
    }

    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.PurchaseOrder,
      voucherId: purchaseOrderId,
      personType: PaymentPersonType.Distributor,
      personId: distributorId,

      cashierId: userId,
      walletId,
      createdAt: time,
      paymentActionType,
      moneyDirection,
      note,

      hasPaymentItem: 0,
      paidTotal: -paidTotal, // với phiếu nhập thì thanh toán bị tính ngược lại
      debtTotal,
      personOpenDebt: distributorOpenDebt,
      personCloseDebt: distributorCloseDebt,
      walletOpenMoney,
      walletCloseMoney,
    }

    const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

    return { purchaseOrderModified, distributorModified, paymentCreated }
  }

  async startPaymentMoney(prop: PurchaseOrderPaymentOperationPropType) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPayment = await this.managerPaymentMoney(manager, prop)
      return managerPayment
    })

    return transaction
  }

  async startPaymentMoneyList(propList: PurchaseOrderPaymentOperationPropType[]) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPaymentList: Awaited<ReturnType<typeof this.managerPaymentMoney>>[] = []
      for (let i = 0; i < propList.length; i++) {
        const prop = propList[i]
        const managerPayment = await this.managerPaymentMoney(manager, prop)
        managerPaymentList.push(managerPayment)
      }
      return managerPaymentList
    })

    return transaction
  }
}
