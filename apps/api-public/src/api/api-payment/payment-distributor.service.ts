import { Injectable } from '@nestjs/common'
import {
  DistributorPayDebtOperation,
  DistributorPrepaymentMoneyOperation,
  DistributorRefundMoneyOperation,
} from '../../../../_libs/database/operations'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  DistributorPayDebtBody,
  DistributorPrepaymentBody,
  DistributorRefundMoneyBody,
  PaymentPostQuery,
} from './request'

@Injectable()
export class PaymentDistributorService {
  customerPaymentOperation: any
  customerRefundOperation: any
  distributorPaymentOperation: any
  distributorRefundOperation: any
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly distributorPayDebtOperation: DistributorPayDebtOperation,
    private readonly distributorPrepaymentMoneyOperation: DistributorPrepaymentMoneyOperation,
    private readonly distributorRefundMoneyOperation: DistributorRefundMoneyOperation
  ) { }

  async distributorPrepaymentMoney(data: {
    oid: number
    userId: number
    body: DistributorPrepaymentBody
    query?: PaymentPostQuery
    options?: { noEmitReceipt?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const prepaymentResult = await this.distributorPrepaymentMoneyOperation.startPrePaymentMoney({
      oid,
      receiptId: body.receiptId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
    })
    const { receiptModified, distributor, paymentCreated } = prepaymentResult
    if (!options?.noEmitReceipt) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: [receiptModified],
      })
    }

    return { receiptModified, distributor, paymentCreated }
  }

  async distributorPayDebt(data: {
    oid: number
    userId: number
    body: DistributorPayDebtBody
    query?: PaymentPostQuery
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
    const { receiptModifiedList, distributorModified, paymentCreatedList } = payDebtResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: receiptModifiedList,
      })
    }
    if (!options?.noEmitDistributor) {
      this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    }

    return { receiptModifiedList, distributorModified, paymentCreatedList }
  }

  async distributorRefundMoney(data: {
    oid: number
    userId: number
    body: DistributorRefundMoneyBody
    query?: PaymentPostQuery
    options?: { noEmitReceipt?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.distributorRefundMoneyOperation.startRefundMoney({
      oid,
      receiptId: body.receiptId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      refundAmount: body.refundAmount,
      note: body.note,
    })
    const { receiptModified, distributor, paymentCreated } = payDebtResult
    if (!options?.noEmitReceipt) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: [receiptModified],
      })
    }

    return { receiptModified, distributor, paymentCreated }
  }
}
