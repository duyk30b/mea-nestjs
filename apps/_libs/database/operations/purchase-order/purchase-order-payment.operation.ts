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
export class PurchaseOrderPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private walletRepository: WalletRepository,
    private distributorRepository: DistributorRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startPayment(options: {
    oid: number
    purchaseOrderId: string
    userId: number
    walletId: string
    paidAmount: number
    time: number
    note: string
  }) {
    const { oid, purchaseOrderId, userId, time, paidAmount, note } = options
    const walletId = options.walletId || '0'
    const PREFIX = `purchaseOrderId=${purchaseOrderId} startPayment failed`
    if (paidAmount <= 0) {
      throw new BusinessError(PREFIX, 'Số tiền thanh toán không hợp lệ')
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const purchaseOrderUpdated = await this.purchaseOrderRepository.managerUpdateOne(
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
          paid: () => `paid + ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${PurchaseOrderStatus.Draft}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Schedule}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Deposited}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Executing}) THEN ${PurchaseOrderStatus.Executing} 
                              WHEN("status" = ${PurchaseOrderStatus.Debt} AND "paid" + ${paidAmount} = "totalMoney") 
                                THEN ${PurchaseOrderStatus.Completed} 
                              WHEN("status" = ${PurchaseOrderStatus.Debt} AND "paid" + ${paidAmount} < "totalMoney") 
                                THEN ${PurchaseOrderStatus.Debt} 
                              ELSE "status"
                          END`,
        }
      )

      if (
        purchaseOrderUpdated.status === PurchaseOrderStatus.Debt
        && purchaseOrderUpdated.paid > purchaseOrderUpdated.totalMoney
      ) {
        throw new BusinessError(PREFIX, 'Số tiền thanh toán không đúng')
      }

      const { distributorId } = purchaseOrderUpdated
      let debtSubtracted = 0
      if (
        purchaseOrderUpdated.debt !== 0
        && purchaseOrderUpdated.paid + purchaseOrderUpdated.debt > purchaseOrderUpdated.totalMoney
      ) {
        const moneyExcess =
          purchaseOrderUpdated.paid + purchaseOrderUpdated.debt - purchaseOrderUpdated.totalMoney
        debtSubtracted = Math.min(purchaseOrderUpdated.debt, moneyExcess)
      }

      let purchaseOrderModified = purchaseOrderUpdated
      let distributorModified: Distributor
      let walletOpenMoney = 0
      let walletCloseMoney = 0
      let distributorOpenDebt = 0
      let distributorCloseDebt = 0

      if (debtSubtracted > 0) {
        purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
          manager,
          { oid, id: purchaseOrderId },
          { debt: purchaseOrderModified.debt - debtSubtracted }
        )
        distributorModified = await this.distributorRepository.managerUpdateOne(
          manager,
          { oid, id: distributorId },
          { debt: () => `debt - ${debtSubtracted}` }
        )
        distributorOpenDebt = distributorModified.debt + debtSubtracted
        distributorCloseDebt = distributorModified.debt
      } else {
        distributorModified = await this.distributorRepository.managerFindOneBy(manager, {
          oid,
          id: distributorId,
        })
        distributorOpenDebt = distributorModified.debt
        distributorCloseDebt = distributorModified.debt
      }

      if (walletId !== '0') {
        const walletModified = await this.walletRepository.managerUpdateOne(
          manager,
          { oid, id: walletId },
          { money: () => `money - ${paidAmount}` }
        )
        walletCloseMoney = walletModified.money
        walletOpenMoney = walletModified.money + paidAmount
      } else {
        // validate wallet
        const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
        if (walletList.length) {
          throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
        }
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
        paymentActionType: PaymentActionType.PaymentMoney,
        moneyDirection: MoneyDirection.Out,
        note,

        hasPaymentItem: 0,
        paidTotal: -paidAmount,
        debtTotal: debtSubtracted,
        personOpenDebt: distributorOpenDebt,
        personCloseDebt: distributorCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      }
      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

      return { purchaseOrderModified, paymentCreated, distributorModified }
    })

    return transaction
  }
}
