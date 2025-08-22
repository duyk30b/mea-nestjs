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
export class DistributorRefundMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private purchaseOrderManager: PurchaseOrderManager
  ) { }

  async startRefundMoney(options: {
    oid: number
    purchaseOrderId: number
    distributorId: number
    cashierId: number
    paymentMethodId: number
    time: number
    refundAmount: number
    note: string
  }) {
    const { oid, purchaseOrderId, distributorId, cashierId, paymentMethodId, time, refundAmount, note } =
      options

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const purchaseOrderModified = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: { IN: [PurchaseOrderStatus.Deposited, PurchaseOrderStatus.Executing] },
          paid: { GTE: refundAmount },
        },
        {
          paid: () => `paid - ${refundAmount}`,
          debt: () => `debt + ${refundAmount}`,
        }
      )

      // === 2. CUSTOMER: query ===
      const distributor = await this.distributorManager.findOneBy(manager, {
        oid,
        id: purchaseOrderModified.distributorId,
      })
      if (!distributor) {
        throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
      }
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.PurchaseOrder,
        voucherId: purchaseOrderModified.id,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.In,
        paymentActionType: PaymentActionType.RefundMoney,
        note: note || '',

        paidAmount: refundAmount,
        debtAmount: 0,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      return { purchaseOrderModified, distributor, paymentCreated }
    })
    return transaction
  }
}
