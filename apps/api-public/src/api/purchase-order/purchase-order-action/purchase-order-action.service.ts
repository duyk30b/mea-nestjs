import { Injectable } from '@nestjs/common'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { Distributor, Payment } from '../../../../../_libs/database/entities'
import { PurchaseOrderStatus } from '../../../../../_libs/database/entities/purchase-order.entity'
import {
  DistributorPrepaymentMoneyOperation,
  DistributorRefundMoneyOperation,
  PurchaseOrderCloseOperation,
  PurchaseOrderReopenOperation,
  PurchaseOrderReturnProductOperation,
  PurchaseOrderSendProductOperation,
} from '../../../../../_libs/database/operations'
import { PurchaseOrderRepository } from '../../../../../_libs/database/repositories/purchase-order.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { PurchaseOrderPaymentMoneyBody } from './request'

@Injectable()
export class PurchaseOrderActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderSendProductOperation: PurchaseOrderSendProductOperation,
    private readonly purchaseOrderCloseOperation: PurchaseOrderCloseOperation,
    private readonly purchaseOrderReturnProductOperation: PurchaseOrderReturnProductOperation,
    private readonly purchaseOrderReopenOperation: PurchaseOrderReopenOperation,
    private readonly distributorPrepaymentMoneyOperation: DistributorPrepaymentMoneyOperation,
    private readonly distributorRefundMoneyOperation: DistributorRefundMoneyOperation
  ) { }

  async destroy(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params
    await this.purchaseOrderRepository.destroy({ oid, purchaseOrderId })
    return { purchaseOrderId }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentMoneyBody
  }) {
    const { oid, userId, purchaseOrderId, body } = params

    const sendProductResult = await this.purchaseOrderSendProductOperation.sendProduct({
      oid,
      userId,
      purchaseOrderId,
      time: Date.now(),
    })

    const paymentCreatedList: Payment[] = []
    if (body.paidAmount > 0) {
      const prepaymentResult = await this.distributorPrepaymentMoneyOperation.startPrePaymentMoney({
        cashierId: userId,
        distributorId: body.distributorId,
        oid,
        purchaseOrderId,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
        paidAmount: body.paidAmount,
        time: Date.now(),
      })
      paymentCreatedList.push(prepaymentResult.paymentCreated)
    }

    const closeResult = await this.purchaseOrderCloseOperation.startClose({
      oid,
      userId,
      purchaseOrderId,
      time: Date.now(),
      note: '',
    })
    paymentCreatedList.push(...closeResult.paymentCreatedList)

    if (closeResult.distributorModified) {
      this.socketEmitService.distributorUpsert(oid, {
        distributor: closeResult.distributorModified,
      })
    }
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: sendProductResult.productModifiedList || [],
    })
    this.socketEmitService.batchListChange(oid, {
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
    })
    this.socketEmitService.batchListChange(oid, {
      batchUpsertedList: sendProductResult.batchModifiedList || [],
    })
    return { purchaseOrderModified: sendProductResult.purchaseOrder }
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
      this.socketEmitService.distributorUpsert(oid, {
        distributor: closeResult.distributorModified,
      })
    }
    return {
      purchaseOrderModified: closeResult.purchaseOrderModified,
      paymentCreatedList: closeResult.paymentCreatedList,
      distributorModified: closeResult.distributorModified,
    }
  }

  async terminate(params: { oid: number; userId: number; purchaseOrderId: string }) {
    const { oid, userId, purchaseOrderId } = params
    const time = Date.now()
    let distributorModified: Distributor

    const purchaseOrderOrigin = await this.purchaseOrderRepository.findOneBy({
      oid,
      id: purchaseOrderId,
    })
    const paymentCreatedList: Payment[] = []

    if (
      [PurchaseOrderStatus.Completed, PurchaseOrderStatus.Debt].includes(purchaseOrderOrigin.status)
    ) {
      const reopenResult = await this.purchaseOrderReopenOperation.reopen({
        oid,
        userId,
        time,
        purchaseOrderId,
        note: '',
      })
      distributorModified = reopenResult.distributorModified
      paymentCreatedList.push(...reopenResult.paymentCreatedList)
    }
    if (purchaseOrderOrigin.paid > 0) {
      const refundResult = await this.distributorRefundMoneyOperation.startRefundMoney({
        oid,
        cashierId: userId,
        time,
        purchaseOrderId,
        paymentMethodId: 0,
        refundAmount: purchaseOrderOrigin.paid,
        note: 'Hủy phiếu',
        distributorId: purchaseOrderOrigin.distributorId,
      })
      distributorModified = refundResult.distributor
      paymentCreatedList.push(refundResult.paymentCreated)
    }

    if (purchaseOrderOrigin.deliveryStatus === DeliveryStatus.Delivered) {
      const returnResult = await this.purchaseOrderReturnProductOperation.returnAllProduct({
        oid,
        purchaseOrderId,
        time: Date.now(),
      })
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnResult.productModifiedList || [],
      })
      this.socketEmitService.batchListChange(oid, {
        batchUpsertedList: returnResult.batchModifiedList || [],
      })
    }

    if (distributorModified) {
      this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    }

    const purchaseOrderModified = await this.purchaseOrderRepository.updateOneAndReturnEntity(
      { oid, id: purchaseOrderId, deliveryStatus: DeliveryStatus.Pending },
      { status: PurchaseOrderStatus.Cancelled }
    )

    return { purchaseOrderModified, paymentCreatedList, distributorModified }
  }
}
