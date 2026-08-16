import { PurchaseOrderTerminalBody } from '@api-public/api/purchase-order/purchase-order-action/request'
import { DeliveryStatus, PurchaseOrderActionType } from '@libs/database/common/variable'
import { Distributor, PaymentPurchaseOrder, PurchaseOrderItem } from '@libs/database/entities'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { PurchaseOrderStatus } from '@libs/database/entities/purchase-order.entity'
import {
  PurchaseOrderChangeDebtOperation,
  PurchaseOrderChangePaidOperation,
  PurchaseOrderOpenCloseOperation,
  PurchaseOrderReturnProductOperation,
} from '@libs/database/operations'
import {
  PaymentPurchaseOrderRepository,
  PurchaseOrderItemRepository,
} from '@libs/database/repositories'
import { PurchaseOrderRepository } from '@libs/database/repositories/purchase-order.repository'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { SocketEmitService } from '../../../socket/socket-emit.service'

@Injectable()
export class PurchaseOrderCancelService {
  constructor(
    private dataSource: DataSource,
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly paymentPurchaseOrderRepository: PaymentPurchaseOrderRepository,
    private readonly purchaseOrderOpenCloseOperation: PurchaseOrderOpenCloseOperation,
    private readonly purchaseOrderReturnProductOperation: PurchaseOrderReturnProductOperation,
    private readonly purchaseOrderChangePaidOperation: PurchaseOrderChangePaidOperation,
    private readonly purchaseOrderChangeDebtOperation: PurchaseOrderChangeDebtOperation
  ) {}

  async terminate(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderTerminalBody
  }) {
    const { oid, userId, purchaseOrderId, body } = params
    const time = Date.now()
    let distributorModified: Distributor = null
    let purchaseOrderItemModifiedAll: PurchaseOrderItem[] = []
    const paymentPurchaseOrderCreatedList: PaymentPurchaseOrder[] = []

    const purchaseOrderOrigin = await this.purchaseOrderRepository.findOneBy({
      oid,
      id: purchaseOrderId,
    })
    let purchaseOrderModified = purchaseOrderOrigin

    if (
      [PurchaseOrderStatus.Completed, PurchaseOrderStatus.Debt].includes(purchaseOrderOrigin.status)
    ) {
      const reopenResult = await this.purchaseOrderOpenCloseOperation.reopen({
        oid,
        purchaseOrderId,
      })
      purchaseOrderModified = reopenResult.purchaseOrderModified
    }
    if (
      [DeliveryStatus.Delivered, DeliveryStatus.Partial].includes(
        purchaseOrderOrigin.deliveryStatus
      )
    ) {
      const returnResult = await this.purchaseOrderReturnProductOperation.returnProduct({
        oid,
        purchaseOrderId,
        time: Date.now(),
        returnType: 'ALL',
        options: { keepQuantity: true },
      })
      purchaseOrderModified = returnResult.purchaseOrderModified
      purchaseOrderItemModifiedAll = returnResult.purchaseOrderItemModifiedAll
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnResult.productModifiedList || [],
        batchUpsertedList: returnResult.batchModifiedList || [],
      })
    }

    if (purchaseOrderModified.paid > 0) {
      const paymentResult = await this.purchaseOrderChangePaidOperation.startPaymentMoney({
        oid,
        purchaseOrderId,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType: PaymentActionType.RefundMoney,
        purchaseOrderActionType: PurchaseOrderActionType.Terminal,
        paidTotal: -purchaseOrderModified.paid,
        time: Date.now(),
        note: body.note,
      })
      purchaseOrderModified = paymentResult.purchaseOrderModified
      distributorModified = paymentResult.distributorModified
      paymentPurchaseOrderCreatedList.push(paymentResult.paymentPurchaseOrderCreated)
    }

    if (purchaseOrderModified.debt > 0) {
      const changeDebtResult = await this.purchaseOrderChangeDebtOperation.startChangeDebt({
        oid,
        distributorId: purchaseOrderModified.distributorId,
        paymentActionType: PaymentActionType.RefundDebt,
        purchaseOrderActionType: PurchaseOrderActionType.Terminal,
        changeDebtList: [{ purchaseOrderId, paid: 0, debt: -purchaseOrderModified.debt }],
        cashierId: userId,
        walletId: '0',
        time: Date.now(),
        note: body.note || '',
      })
      purchaseOrderModified = changeDebtResult.purchaseOrderModifiedList[0]
      distributorModified = changeDebtResult.distributorModified
      paymentPurchaseOrderCreatedList.push(changeDebtResult.paymentPurchaseOrderCreatedList[0])
    }

    const terminalResult = await this.purchaseOrderOpenCloseOperation.startTerminal({
      oid,
      purchaseOrderId,
    })
    purchaseOrderModified = terminalResult.purchaseOrderModified

    if (distributorModified) {
      purchaseOrderModified.distributor = distributorModified
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    }
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      purchaseOrderItem: { upsertedList: purchaseOrderItemModifiedAll },
      paymentPurchaseOrderCreatedList,
    })

    return { purchaseOrderModified }
  }

  async destroy(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params
    const PREFIX = `purchaseOrderID=${purchaseOrderId} destroy failed: `

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderDestroyed = await this.purchaseOrderRepository.managerDeleteOne(manager, {
        oid,
        id: purchaseOrderId,
        status: {
          IN: [
            PurchaseOrderStatus.Draft,
            PurchaseOrderStatus.Schedule,
            PurchaseOrderStatus.Cancelled,
          ],
        },
        paid: 0,
        debt: 0,
        deliveryStatus: {
          IN: [DeliveryStatus.Pending, DeliveryStatus.Empty, DeliveryStatus.Cancelled],
        },
      })

      await this.purchaseOrderItemRepository.managerDelete(manager, { oid, purchaseOrderId })

      const paymentPurchaseOrderDestroyedList =
        await this.paymentPurchaseOrderRepository.managerDelete(manager, {
          oid,
          purchaseOrderId,
        })

      // Tạm thời chưa xóa payment, vì có thể payment này liên quan đến nhiều phiếu khác nhau, nên không xóa payment, chỉ xóa paymentPurchaseOrder thôi
      // const paymentIdList = paymentPurchaseOrderDestroyedList.map((i) => i.paymentId)
      // await this.paymentRepository.managerDelete(manager, {
      //   oid,
      //   id: { IN: paymentIdList },
      //   personType: PaymentPersonType.Distributor,
      //   personId: purchaseOrderDestroyed.distributorId,
      // })

      // await this.productMovementRepository.managerDelete(manager, {
      //   oid,
      //   movementType: MovementType.PurchaseOrder,
      //   voucherId: purchaseOrderId,
      //   contactId: purchaseOrderDestroyed.distributorId,
      // })

      return { purchaseOrderDestroyed }
    })

    this.socketEmitService.socketPurchaseOrderPaginationChange(oid, {
      purchaseOrderDestroyed: transaction.purchaseOrderDestroyed,
    })

    return transaction
  }
}
