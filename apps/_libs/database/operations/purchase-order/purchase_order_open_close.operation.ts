import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import { DeliveryStatus } from '../../common/variable'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'
import { PurchaseOrderRepository } from '../../repositories'

@Injectable()
export class PurchaseOrderOpenCloseOperation {
  constructor(
    private dataSource: DataSource,
    private purchaseOrderRepository: PurchaseOrderRepository
  ) {}

  async startClose(params: { oid: number; purchaseOrderId: string; time: number }) {
    const { oid, purchaseOrderId, time } = params
    const PREFIX = `purchaseOrderId=${purchaseOrderId} close failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. PURCHASE_ORDER: update ===
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: purchaseOrderId,
          deliveryStatus: { IN: [DeliveryStatus.Empty, DeliveryStatus.Delivered] },
          status: {
            IN: [
              PurchaseOrderStatus.Draft,
              PurchaseOrderStatus.Schedule,
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

      if (
        purchaseOrderModified.paid + purchaseOrderModified.debt
        !== purchaseOrderModified.totalMoney
      ) {
        throw new BusinessError(PREFIX, 'Cần điều chỉnh nợ và tiền trước khi đóng phiếu')
      }
      if (
        [DeliveryStatus.Pending, DeliveryStatus.Partial].includes(
          purchaseOrderModified.deliveryStatus
        )
      ) {
        throw new BusinessError(PREFIX, 'Cần nhập hàng trước khi đóng phiếu')
      }

      return { purchaseOrderModified }
    })

    return transaction
  }

  async reopen(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params

    const purchaseOrderModified = await this.purchaseOrderRepository.updateOne(
      {
        oid,
        id: purchaseOrderId,
        status: { IN: [PurchaseOrderStatus.Debt, PurchaseOrderStatus.Completed] },
      },
      { endedAt: null, status: PurchaseOrderStatus.Executing }
    )
    return { purchaseOrderModified }
  }

  async startTerminal(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params

    const PREFIX = `purchaseOrderId=${purchaseOrderId} close failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const purchaseOrderModified = await this.purchaseOrderRepository.managerUpdateOne(
        manager,
        { oid, id: purchaseOrderId },
        {
          updatedAt: Date.now(),
          endedAt: null,
          status: PurchaseOrderStatus.Cancelled,
        }
      )

      if (
        [DeliveryStatus.Partial, DeliveryStatus.Delivered].includes(
          purchaseOrderModified.deliveryStatus
        )
      ) {
        throw new BusinessError(PREFIX, 'Hàng đã được giao, không thể hủy phiếu')
      }

      if (purchaseOrderModified.paid > 0) {
        throw new BusinessError(PREFIX, 'Phiếu đã được thanh toán, không thể hủy phiếu')
      }

      if (purchaseOrderModified.debt > 0) {
        throw new BusinessError(PREFIX, 'Phiếu đã có nợ, không thể hủy phiếu')
      }

      await queryRunner.commitTransaction()

      return { purchaseOrderModified }
    } catch (error: any) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
