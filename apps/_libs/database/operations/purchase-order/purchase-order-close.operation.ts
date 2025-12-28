import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
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
import {
  DistributorRepository,
  PaymentRepository,
  PurchaseOrderRepository,
} from '../../repositories'

@Injectable()
export class PurchaseOrderCloseOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private distributorRepository: DistributorRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startClose(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    time: number
    note: string
  }) {
    const { oid, userId, purchaseOrderId, time, note } = params
    const PREFIX = `purchaseOrderId=${purchaseOrderId} close failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: update ===
      const purchaseOrderUpdated = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Delivered] },
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
          status: () => `CASE 
                            WHEN(paid < "totalMoney") THEN ${PurchaseOrderStatus.Debt} 
                            WHEN(paid = "totalMoney") THEN ${PurchaseOrderStatus.Completed} 
                            ELSE ${PurchaseOrderStatus.Executing}
                        END
                        `,
          endedAt: time,
        }
      )

      if (purchaseOrderUpdated.paid - purchaseOrderUpdated.debt > purchaseOrderUpdated.totalMoney) {
        throw new BusinessError(PREFIX, 'Cần hoàn trả tiền thừa trước khi đóng phiếu')
      }

      const { distributorId } = purchaseOrderUpdated
      let purchaseOrderModified = purchaseOrderUpdated
      let distributorModified: Distributor | null
      let paymentCreated: Payment

      const debtFix =
        purchaseOrderUpdated.totalMoney - (purchaseOrderUpdated.paid + purchaseOrderUpdated.debt)
      // debtFix > 0: ghi nợ
      // debtFix cũng có thể < 0, khi đã thanh toán quá số tiền (===> thành trừ nợ)
      if (debtFix) {
        purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
          manager,
          { oid, id: purchaseOrderId },
          { debt: purchaseOrderUpdated.debt + debtFix }
        )
        distributorModified = await this.distributorRepository.managerUpdateOne(
          manager,
          { oid, id: distributorId },
          { debt: () => `debt + ${debtFix}` }
        )

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: purchaseOrderId,
          personType: PaymentPersonType.Distributor,
          personId: purchaseOrderUpdated.distributorId,

          cashierId: userId,
          walletId: '0',
          createdAt: time,
          paymentActionType: PaymentActionType.Close,
          moneyDirection: MoneyDirection.Other,
          note: note || '',

          hasPaymentItem: 0,
          paidTotal: 0,
          debtTotal: -debtFix,
          personOpenDebt: distributorModified.debt - debtFix,
          personCloseDebt: distributorModified.debt,
          walletOpenMoney: 0,
          walletCloseMoney: 0,
        }

        paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)
      }

      return {
        purchaseOrderModified,
        distributorModified: distributorModified || null,
        paymentCreated,
      }
    })

    return transaction
  }
}
