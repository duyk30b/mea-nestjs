import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { PaymentActionType } from '../../../../../_libs/database/entities/payment.entity'
import {
  PurchaseOrderPaymentOperation,
  PurchaseOrderPaymentOperationPropType,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { PurchaseOrderPayDebtBody, PurchaseOrderPaymentMoneyBody } from './request'

@Injectable()
export class PurchaseOrderMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderPaymentOperation: PurchaseOrderPaymentOperation
  ) { }

  async paymentMoney(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentMoneyBody
  }) {
    const { oid, userId, purchaseOrderId, body } = data
    const paymentResult = await this.purchaseOrderPaymentOperation.startPaymentMoney({
      oid,
      purchaseOrderId,
      userId,
      walletId: body.walletId,
      paymentActionType: body.paymentActionType,
      paidTotal: body.paidTotal,
      debtTotal: body.debtTotal,
      time: Date.now(),
      note: body.note,
    })
    const { purchaseOrderModified, distributorModified, paymentCreated } = paymentResult
    this.socketEmitService.socketPurchaseOrderListChange(oid, {
      purchaseOrderUpsertedList: [purchaseOrderModified],
    })
    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    return { purchaseOrderModified, distributorModified, paymentCreated }
  }

  async payDebt(data: { oid: number; userId: number; body: PurchaseOrderPayDebtBody }) {
    const { oid, userId, body } = data

    const totalMoneyReduce = body.dataList.reduce((acc, item) => {
      return acc + item.debtTotalMinus
    }, 0)
    if (body.totalMoney !== totalMoneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', {
        totalMoney: body.totalMoney,
        totalMoneyReduce,
      })
    }

    const paymentPropList = body.dataList.map((i) => {
      const paymentProp: PurchaseOrderPaymentOperationPropType = {
        oid,
        purchaseOrderId: i.purchaseOrderId,
        userId,
        walletId: body.walletId,
        time: Date.now(),
        note: body.note,
        paymentActionType: PaymentActionType.PayDebt,
        paidTotal: i.debtTotalMinus,
        debtTotal: -i.debtTotalMinus,
      }
      return paymentProp
    })

    const paymentListResult =
      await this.purchaseOrderPaymentOperation.startPaymentMoneyList(paymentPropList)

    paymentListResult.forEach((paymentResult) => {
      this.socketEmitService.socketPurchaseOrderListChange(oid, {
        purchaseOrderUpsertedList: [paymentResult.purchaseOrderModified],
      })
    })

    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })

    return paymentListResult
  }
}
