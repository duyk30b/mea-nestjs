import { Injectable } from '@nestjs/common'
import {
  PurchaseOrderPayDebtOperation,
  PurchaseOrderPaymentOperation,
  PurchaseOrderRefundMoneyOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  PurchaseOrderPayDebtBody,
  PurchaseOrderPaymentBody,
  PurchaseOrderRefundMoneyBody,
} from './request'

@Injectable()
export class PurchaseOrderMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderPayDebtOperation: PurchaseOrderPayDebtOperation,
    private readonly purchaseOrderPaymentOperation: PurchaseOrderPaymentOperation,
    private readonly distributorRefundMoneyOperation: PurchaseOrderRefundMoneyOperation
  ) { }

  async payment(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentBody
  }) {
    const { oid, userId, purchaseOrderId, body } = data
    const prepaymentResult = await this.purchaseOrderPaymentOperation.startPayment({
      oid,
      purchaseOrderId,
      userId,
      walletId: body.walletId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
    })
    const { purchaseOrderModified, distributorModified, paymentCreated } = prepaymentResult
    this.socketEmitService.socketPurchaseOrderListChange(oid, {
      purchaseOrderUpsertedList: [purchaseOrderModified],
    })
    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    return { purchaseOrderModified, distributorModified, paymentCreated }
  }

  async payDebt(data: { oid: number; userId: number; body: PurchaseOrderPayDebtBody }) {
    const { oid, userId, body } = data
    const payDebtResult = await this.purchaseOrderPayDebtOperation.startPayDebt({
      oid,
      distributorId: body.distributorId,
      userId,
      walletId: body.walletId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
      dataList: body.dataList,
    })
    const { purchaseOrderModifiedList, distributorModified, paymentCreatedList } = payDebtResult

    this.socketEmitService.socketPurchaseOrderListChange(oid, {
      purchaseOrderUpsertedList: purchaseOrderModifiedList,
    })
    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })

    return { purchaseOrderModifiedList, distributorModified, paymentCreatedList }
  }

  async refundMoney(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderRefundMoneyBody
  }) {
    const { oid, userId, body, purchaseOrderId } = data
    const payDebtResult = await this.distributorRefundMoneyOperation.startRefundMoney({
      oid,
      purchaseOrderId,
      userId,
      walletId: body.walletId,
      time: Date.now(),
      refundAmount: body.refundAmount,
      note: body.note,
    })
    const { purchaseOrderModified, distributor, paymentCreated } = payDebtResult
    this.socketEmitService.socketPurchaseOrderListChange(oid, {
      purchaseOrderUpsertedList: [purchaseOrderModified],
    })

    return { purchaseOrderModified, distributor, paymentCreated }
  }
}
