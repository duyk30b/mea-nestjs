import { PurchaseOrderActionType } from '@libs/database/common/variable'
import { Distributor, PaymentPurchaseOrder } from '@libs/database/entities'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import PurchaseOrder, { PurchaseOrderStatus } from '@libs/database/entities/purchase-order.entity'
import {
  PurchaseOrderChangeDebtOperation,
  PurchaseOrderChangePaidOperation,
  PurchaseOrderItemReturnType,
  PurchaseOrderOpenCloseOperation,
  PurchaseOrderReceiveProductOperation,
  PurchaseOrderReturnProductOperation,
  ReceiveProductExecuteType,
} from '@libs/database/operations'
import { PurchaseOrderRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { PurchaseOrderPaymentMoneyBody } from '../purchase-order-money/request'

@Injectable()
export class PurchaseOrderActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderReceiveProductOperation: PurchaseOrderReceiveProductOperation,
    private readonly purchaseOrderReturnProductOperation: PurchaseOrderReturnProductOperation,
    private readonly purchaseOrderChangePaidOperation: PurchaseOrderChangePaidOperation,
    private readonly purchaseOrderChangeDebtOperation: PurchaseOrderChangeDebtOperation,
    private readonly purchaseOrderOpenCloseOperation: PurchaseOrderOpenCloseOperation
  ) {}

  async startExecuting(options: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = options
    const purchaseOrderModified = await this.purchaseOrderRepository.updateOne(
      {
        oid,
        id: purchaseOrderId,
        status: {
          IN: [PurchaseOrderStatus.Draft, PurchaseOrderStatus.Schedule],
        },
      },
      { status: PurchaseOrderStatus.Executing }
    )
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
    })
    return { purchaseOrderModified }
  }

  async receiveProduct(
    props: {
      oid: number
      purchaseOrderId: string
    } & (
      | { receiveType: 'ALL' }
      | {
          receiveType: 'PARTIAL'
          receiveList: ReceiveProductExecuteType[]
        }
    )
  ) {
    const { oid, purchaseOrderId } = props

    const receiveProductResult = await this.purchaseOrderReceiveProductOperation.startReceive({
      oid,
      purchaseOrderId,
      time: Date.now(),
      receiveType: props.receiveType,
      receiveList: 'receiveList' in props ? props.receiveList : undefined,
    })
    const { purchaseOrderModified, purchaseOrderItemModifiedAll } = receiveProductResult

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: receiveProductResult.productModifiedList || [],
      batchUpsertedList: receiveProductResult.batchModifiedList || [],
    })
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      purchaseOrderItem: { upsertedList: purchaseOrderItemModifiedAll },
    })
    return { purchaseOrderModified, purchaseOrderItemModifiedAll }
  }

  async returnProduct(
    props: {
      oid: number
      purchaseOrderId: string
      options?: { keepQuantity?: boolean }
    } & (
      | { returnType: 'ALL' }
      | {
          returnType: 'PARTIAL'
          returnList: PurchaseOrderItemReturnType[]
        }
    )
  ) {
    const { oid, purchaseOrderId } = props

    const returnProductResult = await this.purchaseOrderReturnProductOperation.returnProduct({
      oid,
      purchaseOrderId,
      time: Date.now(),
      returnType: props.returnType,
      returnList: 'returnList' in props ? props.returnList : undefined,
      options: props.options,
    })
    const { purchaseOrderModified, purchaseOrderItemModifiedAll } = returnProductResult

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: returnProductResult.productModifiedList || [],
      batchUpsertedList: returnProductResult.batchModifiedList || [],
    })

    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      purchaseOrderItem: { upsertedList: purchaseOrderItemModifiedAll },
    })

    return {
      purchaseOrderModified,
      purchaseOrderItemModifiedAll,
    }
  }

  async receiveProductAndPaymentAndClose(params: {
    oid: number
    userId: number
    purchaseOrderId: string
    body: PurchaseOrderPaymentMoneyBody
  }) {
    const { oid, userId, purchaseOrderId, body } = params
    const time = Date.now()
    let purchaseOrderModified: PurchaseOrder
    let distributorModified: Distributor
    const paymentPurchaseOrderCreatedList: PaymentPurchaseOrder[] = []

    const receiveProductResult = await this.purchaseOrderReceiveProductOperation.startReceive({
      oid,
      purchaseOrderId,
      time,
      receiveType: 'ALL',
    })
    purchaseOrderModified = receiveProductResult.purchaseOrderModified

    if (body.paidTotal > 0) {
      const prepaymentResult = await this.purchaseOrderChangePaidOperation.startPaymentMoney({
        oid,
        purchaseOrderId,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType: PaymentActionType.PaymentMoney,
        purchaseOrderActionType: PurchaseOrderActionType.ReceiveProductAndPaymentAndClose,
        paidTotal: body.paidTotal,
        time,
        note: body.note,
      })
      distributorModified = prepaymentResult.distributorModified
      purchaseOrderModified = prepaymentResult.purchaseOrderModified
      paymentPurchaseOrderCreatedList.push(prepaymentResult.paymentPurchaseOrderCreated)
    }

    const debtFix =
      purchaseOrderModified.totalMoney - purchaseOrderModified.paid - purchaseOrderModified.debt
    if (debtFix != 0) {
      const changeDebtResult = await this.purchaseOrderChangeDebtOperation.startChangeDebt({
        oid,
        distributorId: purchaseOrderModified.distributorId,
        cashierId: userId,
        walletId: '0',
        time,
        note: '',
        paymentActionType: PaymentActionType.Debit,
        purchaseOrderActionType: PurchaseOrderActionType.ReceiveProductAndPaymentAndClose,
        changeDebtList: [{ purchaseOrderId, paid: 0, debt: debtFix }],
      })
      distributorModified = changeDebtResult.distributorModified
      purchaseOrderModified = changeDebtResult.purchaseOrderModifiedList[0]
      paymentPurchaseOrderCreatedList.push(changeDebtResult.paymentPurchaseOrderCreatedList[0])
    }

    const closeResult = await this.purchaseOrderOpenCloseOperation.startClose({
      oid,
      purchaseOrderId,
      time,
    })
    purchaseOrderModified = closeResult.purchaseOrderModified

    if (distributorModified) {
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
      purchaseOrderModified.distributor = distributorModified
    }
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      purchaseOrderItem: { upsertedList: receiveProductResult.purchaseOrderItemModifiedAll },
      paymentPurchaseOrderCreatedList,
    })
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: receiveProductResult.productModifiedList || [],
      batchUpsertedList: receiveProductResult.batchModifiedList || [],
    })

    return {
      purchaseOrderModified,
      purchaseOrderItemModifiedAll: receiveProductResult.purchaseOrderItemModifiedAll,
    }
  }

  async close(params: { oid: number; userId: number; purchaseOrderId: string }) {
    const { oid, userId, purchaseOrderId } = params
    let distributorModified: Distributor
    const paymentPurchaseOrderCreatedList: PaymentPurchaseOrder[] = []

    const purchaseOrderOriginal = await this.purchaseOrderRepository.findOneBy({
      oid,
      id: purchaseOrderId,
    })

    const debtFix =
      purchaseOrderOriginal.totalMoney - purchaseOrderOriginal.paid - purchaseOrderOriginal.debt
    if (debtFix != 0) {
      const changeDebtResult = await this.purchaseOrderChangeDebtOperation.startChangeDebt({
        oid,
        distributorId: purchaseOrderOriginal.distributorId,
        cashierId: userId,
        walletId: '0',
        time: Date.now(),
        note: '',
        paymentActionType: debtFix > 0 ? PaymentActionType.Debit : PaymentActionType.RefundDebt,
        purchaseOrderActionType: PurchaseOrderActionType.Close,
        changeDebtList: [{ purchaseOrderId, paid: 0, debt: debtFix }],
      })
      distributorModified = changeDebtResult.distributorModified
      paymentPurchaseOrderCreatedList.push(changeDebtResult.paymentPurchaseOrderCreatedList[0])
    }

    const closeResult = await this.purchaseOrderOpenCloseOperation.startClose({
      oid,
      purchaseOrderId,
      time: Date.now(),
    })

    const { purchaseOrderModified } = closeResult
    if (distributorModified) {
      purchaseOrderModified.distributor = distributorModified
      this.socketEmitService.socketMasterDataChange(oid, { distributor: true })
    }

    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
      paymentPurchaseOrderCreatedList,
    })

    return { purchaseOrderModified }
  }

  async reopen(params: { oid: number; purchaseOrderId: string }) {
    const { oid, purchaseOrderId } = params

    const reopenResult = await this.purchaseOrderOpenCloseOperation.reopen({
      oid,
      purchaseOrderId,
    })

    const { purchaseOrderModified } = reopenResult
    this.socketEmitService.socketPurchaseOrderChange(oid, {
      purchaseOrderId,
      purchaseOrderModified,
    })
    return { purchaseOrderModified }
  }
}
