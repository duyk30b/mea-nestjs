import { Injectable } from '@nestjs/common'
import {
  DistributorPayDebtOperation,
  DistributorPrepaymentMoneyOperation,
  DistributorRefundMoneyOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  DistributorPayDebtBody,
  DistributorPrepaymentBody,
  DistributorRefundMoneyBody,
} from './request'

@Injectable()
export class PurchaseOrderMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly distributorPayDebtOperation: DistributorPayDebtOperation,
    private readonly distributorPrepaymentMoneyOperation: DistributorPrepaymentMoneyOperation,
    private readonly distributorRefundMoneyOperation: DistributorRefundMoneyOperation
  ) { }

  async prepaymentMoney(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: DistributorPrepaymentBody
    options?: { noEmitPurchaseOrder?: boolean }
  }) {
    const { oid, userId, purchaseOrderId, body, options } = data
    const prepaymentResult = await this.distributorPrepaymentMoneyOperation.startPrePaymentMoney({
      oid,
      purchaseOrderId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
    })
    const { purchaseOrderModified, distributor, paymentCreated } = prepaymentResult
    if (!options?.noEmitPurchaseOrder) {
      this.socketEmitService.socketPurchaseOrderListChange(oid, {
        purchaseOrderUpsertedList: [purchaseOrderModified],
      })
    }

    return { purchaseOrderModified, distributor, paymentCreated }
  }

  async payDebt(data: {
    oid: number
    userId: number
    body: DistributorPayDebtBody
    options?: { noEmitTicket?: boolean; noEmitDistributor?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.distributorPayDebtOperation.startPayDebt({
      oid,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
      dataList: body.dataList,
    })
    const { purchaseOrderModifiedList, distributorModified, paymentCreatedList } = payDebtResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketPurchaseOrderListChange(oid, {
        purchaseOrderUpsertedList: purchaseOrderModifiedList,
      })
    }
    if (!options?.noEmitDistributor) {
      this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    }

    return { purchaseOrderModifiedList, distributorModified, paymentCreatedList }
  }

  async refundMoney(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: DistributorRefundMoneyBody
    options?: { noEmitPurchaseOrder?: boolean }
  }) {
    const { oid, userId, body, options, purchaseOrderId } = data
    const payDebtResult = await this.distributorRefundMoneyOperation.startRefundMoney({
      oid,
      purchaseOrderId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      refundAmount: body.refundAmount,
      note: body.note,
    })
    const { purchaseOrderModified, distributor, paymentCreated } = payDebtResult
    if (!options?.noEmitPurchaseOrder) {
      this.socketEmitService.socketPurchaseOrderListChange(oid, {
        purchaseOrderUpsertedList: [purchaseOrderModified],
      })
    }

    return { purchaseOrderModified, distributor, paymentCreated }
  }
}
