import { PurchaseOrderActionType } from '@libs/database/common/variable'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import {
  PurchaseOrderChangeDebtOperation,
  PurchaseOrderChangePaidOperation,
} from '@libs/database/operations'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { PurchaseOrderPayDebtBody, PurchaseOrderPaymentMoneyBody } from './request'

@Injectable()
export class PurchaseOrderMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderChangePaidOperation: PurchaseOrderChangePaidOperation,
    private readonly purchaseOrderChangeDebtOperation: PurchaseOrderChangeDebtOperation
  ) {}

  async paymentMoney(data: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentMoneyBody
  }) {
    const { oid, userId, purchaseOrderId, body } = data
    const paymentResult = await this.purchaseOrderChangePaidOperation.startPaymentMoney({
      oid,
      purchaseOrderId,
      cashierId: userId,
      walletId: body.walletId,
      paymentActionType: body.paymentActionType,
      time: Date.now(),
      note: body.note,
      paidTotal: body.paidTotal,
      purchaseOrderActionType: body.purchaseOrderActionType,
    })
    const { purchaseOrderModified, distributorModified, paymentPurchaseOrderCreated } =
      paymentResult

    purchaseOrderModified.distributor = distributorModified
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      paymentPurchaseOrderCreatedList: [paymentPurchaseOrderCreated],
    })
    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    return { purchaseOrderModified }
  }

  async payDebt(data: { oid: number; userId: number; body: PurchaseOrderPayDebtBody }) {
    const { oid, userId, body } = data

    const payDebtResult = await this.purchaseOrderChangeDebtOperation.startChangeDebt({
      oid,
      distributorId: body.distributorId,
      cashierId: userId,
      walletId: body.walletId,
      time: Date.now(),
      note: body.note,
      paymentActionType: PaymentActionType.PayDebt,
      purchaseOrderActionType: PurchaseOrderActionType.PayDebt,
      changeDebtList: body.changeDebtList,
    })

    const { distributorModified, purchaseOrderModifiedList, paymentPurchaseOrderCreatedList } =
      payDebtResult

    purchaseOrderModifiedList.forEach((purchaseOrderModified) => {
      purchaseOrderModified.distributor = distributorModified
      this.socketEmitService.socketPurchaseOrderChange(oid, {
        purchaseOrderId: purchaseOrderModified.id,
        purchaseOrderModified,
        paymentPurchaseOrderCreatedList: paymentPurchaseOrderCreatedList.filter((p) => {
          return p.purchaseOrderId === purchaseOrderModified.id
        }),
      })
    })

    this.socketEmitService.socketMasterDataChange(oid, { distributor: true })

    return { purchaseOrderModifiedList, distributorModified }
  }
}
