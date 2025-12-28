import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
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
  WalletRepository,
} from '../../repositories'

@Injectable()
export class PurchaseOrderTerminalOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private distributorRepository: DistributorRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startTerminal(params: {
    oid: number
    purchaseOrderId: string
    walletId: string
    time: number
    note: string
    userId: number
  }) {
    const { oid, purchaseOrderId, userId, time, note } = params
    const walletId = params.walletId || '0'

    const PREFIX = `purchaseOrderId=${purchaseOrderId} close failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
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
            ],
          },
        },
        {
          endedAt: null,
          status: PurchaseOrderStatus.Cancelled,
        }
      )

      let purchaseOrderModified = purchaseOrderUpdated
      let distributorModified: Distributor
      let paymentCreated: Payment

      if (purchaseOrderUpdated.paid !== 0 || purchaseOrderUpdated.debt !== 0) {
        const { distributorId } = purchaseOrderUpdated
        let walletOpenMoney = 0
        let walletCloseMoney = 0

        if (purchaseOrderUpdated.debt !== 0) {
          distributorModified = await this.distributorRepository.managerUpdateOne(
            manager,
            { oid, id: distributorId },
            { debt: () => `debt - ${purchaseOrderUpdated.debt}` }
          )
        } else {
          distributorModified = await this.distributorRepository.managerFindOneBy(manager, {
            oid,
            id: distributorId,
          })
        }

        if (purchaseOrderUpdated.paid !== 0) {
          if (walletId !== '0') {
            const walletModified = await this.walletRepository.managerUpdateOne(
              manager,
              { oid, id: walletId },
              { money: () => `money + ${purchaseOrderUpdated.paid}` }
            )
            walletCloseMoney = walletModified.money
            walletOpenMoney = walletModified.money - purchaseOrderUpdated.paid
          } else {
            // validate wallet
            const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
            if (walletList.length) {
              throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
            }
          }
        }

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.PurchaseOrder,
          voucherId: purchaseOrderId,
          personType: PaymentPersonType.Distributor,
          personId: distributorId,

          cashierId: userId,
          walletId: purchaseOrderUpdated.paid !== 0 ? walletId : '0',
          createdAt: time,
          paymentActionType: PaymentActionType.Terminal,
          moneyDirection:
            purchaseOrderUpdated.paid !== 0 ? MoneyDirection.In : MoneyDirection.Other,
          note: note || '',

          hasPaymentItem: 0,
          paidTotal: purchaseOrderUpdated.paid,
          debtTotal: purchaseOrderUpdated.debt,
          personOpenDebt: distributorModified.debt + purchaseOrderUpdated.debt,
          personCloseDebt: distributorModified.debt,
          walletOpenMoney,
          walletCloseMoney,
        }

        paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

        purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
          manager,
          { oid, id: purchaseOrderId },
          { paid: 0, debt: 0 }
        )
      }

      await queryRunner.commitTransaction()

      return {
        purchaseOrderModified,
        distributorModified,
        paymentCreated,
      }
    } catch (error) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
