import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus, MovementType } from '../../../../../_libs/database/common/variable'
import { Distributor, Payment } from '../../../../../_libs/database/entities'
import {
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../../_libs/database/entities/payment.entity'
import { PurchaseOrderStatus } from '../../../../../_libs/database/entities/purchase-order.entity'
import {
  PurchaseOrderCloseOperation,
  PurchaseOrderPaymentOperation,
  PurchaseOrderRefundMoneyOperation,
  PurchaseOrderReopenOperation,
  PurchaseOrderReturnProductOperation,
  PurchaseOrderSendProductOperation,
  PurchaseOrderTerminalOperation,
} from '../../../../../_libs/database/operations'
import {
  PaymentRepository,
  ProductMovementRepository,
  PurchaseOrderItemRepository,
} from '../../../../../_libs/database/repositories'
import { PurchaseOrderRepository } from '../../../../../_libs/database/repositories/purchase-order.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { PurchaseOrderPaymentBody } from '../purchase-order-money/request'
import { PurchaseOrderTerminalBody } from './request'

@Injectable()
export class PurchaseOrderActionService {
  constructor(
    private dataSource: DataSource,
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly purchaseOrderSendProductOperation: PurchaseOrderSendProductOperation,
    private readonly purchaseOrderCloseOperation: PurchaseOrderCloseOperation,
    private readonly purchaseOrderReturnProductOperation: PurchaseOrderReturnProductOperation,
    private readonly purchaseOrderReopenOperation: PurchaseOrderReopenOperation,
    private readonly purchaseOrderPaymentOperation: PurchaseOrderPaymentOperation,
    private readonly purchaseOrderRefundMoneyOperation: PurchaseOrderRefundMoneyOperation,
    private readonly purchaseOrderTerminalOperation: PurchaseOrderTerminalOperation
  ) { }

  async destroy(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const purchaseOrderDestroyed = await this.purchaseOrderRepository.managerDeleteOne(manager, {
        oid,
        id: purchaseOrderId,
        paid: 0,
        status: {
          IN: [
            PurchaseOrderStatus.Draft,
            PurchaseOrderStatus.Schedule,
            PurchaseOrderStatus.Deposited,
            PurchaseOrderStatus.Cancelled,
          ],
        },
      })
      await this.purchaseOrderItemRepository.managerDelete(manager, { oid, purchaseOrderId })
      await this.paymentRepository.managerDelete(manager, {
        oid,
        voucherType: PaymentVoucherType.PurchaseOrder,
        voucherId: purchaseOrderId,
        personType: PaymentPersonType.Distributor,
        personId: purchaseOrderDestroyed.distributorId,
      })
      await this.productMovementRepository.managerDelete(manager, {
        oid,
        movementType: MovementType.PurchaseOrder,
        voucherId: purchaseOrderId,
        contactId: purchaseOrderDestroyed.distributorId,
      })
    })

    return { purchaseOrderId }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentBody
  }) {
    const { oid, userId, purchaseOrderId, body } = params
    const time = Date.now()

    const sendProductResult = await this.purchaseOrderSendProductOperation.sendProduct({
      oid,
      userId,
      purchaseOrderId,
      time,
    })

    const paymentCreatedList: Payment[] = []
    if (body.paidAmount > 0) {
      const prepaymentResult = await this.purchaseOrderPaymentOperation.startPayment({
        userId,
        oid,
        purchaseOrderId,
        walletId: body.walletId,
        note: body.note,
        paidAmount: body.paidAmount,
        time,
      })
      paymentCreatedList.push(prepaymentResult.paymentCreated)
    }

    const closeResult = await this.purchaseOrderCloseOperation.startClose({
      oid,
      userId,
      purchaseOrderId,
      time,
      note: '',
    })
    if (closeResult.paymentCreated) {
      paymentCreatedList.push(closeResult.paymentCreated)
    }

    if (closeResult.distributorModified) {
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    }
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: sendProductResult.productModifiedList || [],
      batchUpsertedList: sendProductResult.batchModifiedList || [],
    })

    return {
      purchaseOrderModified: closeResult.purchaseOrderModified,
      distributorModified: closeResult.distributorModified,
      paymentCreatedList,
    }
  }

  async sendProduct(params: { oid: number; userId: number; purchaseOrderId: string }) {
    const { oid, userId, purchaseOrderId } = params

    const sendProductResult = await this.purchaseOrderSendProductOperation.sendProduct({
      oid,
      userId,
      purchaseOrderId,
      time: Date.now(),
    })

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: sendProductResult.productModifiedList || [],
      batchUpsertedList: sendProductResult.batchModifiedList || [],
    })
    return { purchaseOrderModified: sendProductResult.purchaseOrderModified }
  }

  async close(params: { oid: number; userId: number; purchaseOrderId: string }) {
    const { oid, userId, purchaseOrderId } = params

    const closeResult = await this.purchaseOrderCloseOperation.startClose({
      oid,
      userId,
      purchaseOrderId,
      time: Date.now(),
      note: '',
    })
    if (closeResult.distributorModified) {
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    }
    return {
      purchaseOrderModified: closeResult.purchaseOrderModified,
      paymentCreated: closeResult.paymentCreated,
      distributorModified: closeResult.distributorModified,
    }
  }

  async terminate(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderTerminalBody
  }) {
    const { oid, userId, purchaseOrderId, body } = params
    const time = Date.now()
    let distributorModified: Distributor = null

    const purchaseOrderOrigin = await this.purchaseOrderRepository.findOneBy({
      oid,
      id: purchaseOrderId,
    })
    let purchaseOrderModified = purchaseOrderOrigin

    if (
      [PurchaseOrderStatus.Completed, PurchaseOrderStatus.Debt].includes(purchaseOrderOrigin.status)
    ) {
      const reopenResult = await this.purchaseOrderReopenOperation.reopen({
        oid,
        purchaseOrderId,
      })
      purchaseOrderModified = reopenResult.purchaseOrderModified
    }
    if (purchaseOrderOrigin.deliveryStatus === DeliveryStatus.Delivered) {
      const returnResult = await this.purchaseOrderReturnProductOperation.returnAllProduct({
        oid,
        purchaseOrderId,
        time: Date.now(),
      })
      purchaseOrderModified = returnResult.purchaseOrderModified
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnResult.productModifiedList || [],
        batchUpsertedList: returnResult.batchModifiedList || [],
      })
    }

    const terminalResult = await this.purchaseOrderTerminalOperation.startTerminal({
      oid,
      purchaseOrderId,
      userId,
      time,
      note: body.note,
      walletId: body.walletId,
    })
    distributorModified = terminalResult.distributorModified
    purchaseOrderModified = terminalResult.purchaseOrderModified || purchaseOrderModified

    if (distributorModified) {
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    }

    return {
      purchaseOrderModified,
      paymentCreated: terminalResult.paymentCreated,
      distributorModified,
    }
  }
}
