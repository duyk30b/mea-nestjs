import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
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
export class DistributorPrepaymentMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private purchaseOrderManager: PurchaseOrderManager
  ) { }

  async startPrePaymentMoney(options: {
    oid: number
    purchaseOrderId: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
  }) {
    const { oid, purchaseOrderId, distributorId, cashierId, paymentMethodId, time, paidAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const purchaseOrderModified = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          distributorId,
          status: {
            IN: [
              PurchaseOrderStatus.Draft,
              PurchaseOrderStatus.Schedule,
              PurchaseOrderStatus.Deposited,
              PurchaseOrderStatus.Executing,
            ],
          },
        },
        {
          paid: () => `paid + ${paidAmount}`,
          debt: () => `debt - ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${PurchaseOrderStatus.Draft}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Schedule}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Deposited}) THEN ${PurchaseOrderStatus.Deposited} 
                              WHEN("status" = ${PurchaseOrderStatus.Executing}) THEN ${PurchaseOrderStatus.Executing} 
                              ELSE ${PurchaseOrderStatus.Executing}
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
        voucherType: PaymentVoucherType.PurchaseOrder,
        voucherId: purchaseOrderModified.id,
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

      return { purchaseOrderModified, paymentCreated, distributor }
    })

    return transaction
  }
}
