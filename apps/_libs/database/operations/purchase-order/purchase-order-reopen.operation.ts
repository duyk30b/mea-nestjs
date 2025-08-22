import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Distributor } from '../../entities'
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
export class PurchaseOrderReopenOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private paymentManager: PaymentManager,
    private distributorManager: DistributorManager
  ) { }

  // Hàm này mục đích để quay về tạo thành 1 trường hợp chưa thanh toán
  async reopen(params: {
    oid: number
    userId: number
    purchaseOrderId: number
    time: number
    note: string
  }) {
    const { oid, userId, purchaseOrderId, time, note } = params

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. PURCHASE_ORDER: update ===
      const purchaseOrderModified = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        { oid, id: purchaseOrderId },
        { endedAt: null, status: PurchaseOrderStatus.Executing }
      )

      const paymentCreatedList = []
      let distributorModified: Distributor
      if (purchaseOrderModified.debt > 0) {
        const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: purchaseOrderModified.distributorId },
          { debt: () => `debt - ${purchaseOrderModified.debt}` }
        )

        const distributorCloseDebt = distributorModified.debt
        const distributorOpenDebt = distributorCloseDebt + purchaseOrderModified.debt

        // === 3. INSERT CUSTOMER_PAYMENT ===
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: purchaseOrderId,
          personType: PaymentPersonType.Distributor,
          personId: purchaseOrderModified.distributorId,

          cashierId: userId,
          paymentMethodId: 0,
          createdAt: time,
          paymentActionType: PaymentActionType.Reopen,
          moneyDirection: MoneyDirection.Other,
          note: note || '',

          paidAmount: 0,
          debtAmount: -purchaseOrderModified.debt,
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )
        paymentCreatedList.push(paymentCreated)
      }

      return { purchaseOrderModified, paymentCreatedList, distributorModified }
    })

    return transaction
  }
}
