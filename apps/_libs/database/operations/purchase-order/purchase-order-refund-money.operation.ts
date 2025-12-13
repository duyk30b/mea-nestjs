import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
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
export class PurchaseOrderRefundMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private walletRepository: WalletRepository,
    private distributorRepository: DistributorRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startRefundMoney(options: {
    oid: number
    purchaseOrderId: string
    userId: number
    walletId: string
    refundAmount: number
    time: number
    note: string
  }) {
    const { oid, purchaseOrderId, userId, time, refundAmount, note } = options
    const walletId = options.walletId || '0'

    const PREFIX = `purchaseOrderId=${purchaseOrderId} startRefundMoney failed`
    if (refundAmount <= 0) {
      throw new BusinessError(PREFIX, 'Số tiền hoàn trả không hợp lệ')
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          status: { IN: [PurchaseOrderStatus.Deposited, PurchaseOrderStatus.Executing] },
          paid: { GTE: refundAmount },
        },
        { paid: () => `paid - ${refundAmount}` }
      )

      const { distributorId } = purchaseOrderModified

      // === 2. CUSTOMER: query ===
      const distributor = await this.distributorRepository.managerFindOneBy(manager, {
        oid,
        id: purchaseOrderModified.distributorId,
      })
      if (!distributor) {
        throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
      }
      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributor.debt

      let walletOpenMoney = 0
      let walletCloseMoney = 0

      if (walletId !== '0') {
        const walletModified = await this.walletRepository.managerUpdateOne(
          manager,
          { oid, id: walletId },
          { money: () => `money + ${refundAmount}` }
        )
        walletCloseMoney = walletModified.money
        walletOpenMoney = walletModified.money - refundAmount
      } else {
        // validate wallet
        const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
        if (walletList.length) {
          throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
        }
      }

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.PurchaseOrder,
        voucherId: purchaseOrderModified.id,
        personType: PaymentPersonType.Distributor,
        personId: distributorId,

        createdAt: time,
        walletId,
        cashierId: userId,
        moneyDirection: MoneyDirection.In,
        paymentActionType: PaymentActionType.RefundMoney,
        note: note || '',

        paid: refundAmount,
        paidItem: 0,
        debt: 0,
        debtItem: 0,
        personOpenDebt: distributorOpenDebt,
        personCloseDebt: distributorCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      }
      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

      return { purchaseOrderModified, distributor, paymentCreated }
    })
    return transaction
  }
}
