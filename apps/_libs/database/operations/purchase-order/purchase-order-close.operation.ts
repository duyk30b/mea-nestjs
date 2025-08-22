import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../common/variable'
import { Distributor } from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { DistributorManager, PaymentManager, PurchaseOrderManager } from '../../repositories'

@Injectable()
export class PurchaseOrderCloseOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderManager: PurchaseOrderManager,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager
  ) { }

  async startClose(params: {
    oid: number
    userId: number
    purchaseOrderId: number
    time: number
    note: string
  }) {
    const { oid, userId, purchaseOrderId, time, note } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: update ===
      const purchaseOrderUpdated = await this.purchaseOrderManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: purchaseOrderId,
          deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Delivered] },
          status: { IN: [PurchaseOrderStatus.Draft, PurchaseOrderStatus.Deposited, PurchaseOrderStatus.Executing] },
        },
        {
          status: () => `CASE 
                            WHEN(paid > "totalMoney") THEN ${PurchaseOrderStatus.Executing} 
                            WHEN(paid < "totalMoney") THEN ${PurchaseOrderStatus.Debt} 
                            ELSE ${PurchaseOrderStatus.Completed}
                        END
                        `,
          endedAt: time,
        }
      )

      let newDebtPurchaseOrder = purchaseOrderUpdated.debt
      let distributorModified: Distributor
      const paymentCreatedList: Payment[] = []

      if (purchaseOrderUpdated.debt > 0) {
        let paidByTopUp = 0
        const distributorOrigin = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: purchaseOrderUpdated.distributorId, isActive: 1 },
          { isActive: 1 }
        )
        if (distributorOrigin.debt < 0) {
          const topUpMoney = -distributorOrigin.debt
          paidByTopUp = Math.min(purchaseOrderUpdated.debt, topUpMoney)
        }
        newDebtPurchaseOrder = purchaseOrderUpdated.debt - paidByTopUp
        const newDebtCustomer = distributorOrigin.debt + paidByTopUp + newDebtPurchaseOrder
        // const newDebtCustomer = distributorOrigin.debt + purchaseOrderModified.debt ==> tính đi tính lại thì nó vẫn thế này

        distributorModified = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: purchaseOrderUpdated.distributorId },
          { debt: newDebtCustomer }
        )

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: purchaseOrderId,
          personType: PaymentPersonType.Distributor,
          personId: purchaseOrderUpdated.distributorId,

          cashierId: userId,
          paymentMethodId: 0,
          createdAt: time,
          paymentActionType: PaymentActionType.Close,
          moneyDirection: MoneyDirection.Other,
          note: note || '',

          paidAmount: 0,
          debtAmount: paidByTopUp + newDebtPurchaseOrder, // thực ra thì vẫn = purchaseOrderUpdated.debt
          openDebt: distributorOrigin.debt,
          closeDebt: distributorModified.debt,
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )
        paymentCreatedList.push(paymentCreated)
      }

      let purchaseOrderModified = purchaseOrderUpdated
      if (purchaseOrderUpdated.debt !== newDebtPurchaseOrder) {
        purchaseOrderModified = await this.purchaseOrderManager.updateOneAndReturnEntity(
          manager,
          { oid, id: purchaseOrderId },
          { debt: newDebtPurchaseOrder, paid: purchaseOrderUpdated.totalMoney - newDebtPurchaseOrder }
        )
      }

      return { purchaseOrderModified, paymentCreatedList, distributorModified }
    })

    return transaction
  }
}
