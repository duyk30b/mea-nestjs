import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { Distributor } from '../../../../_libs/database/entities'
import PaymentItem, {
  PaymentVoucherItemType,
} from '../../../../_libs/database/entities/payment-item.entity'
import { ReceiptStatus } from '../../../../_libs/database/entities/receipt.entity'
import {
  DistributorPaymentOperation,
  DistributorRefundOperation,
  ReceiptCloseOperation,
  ReceiptReopenOperation,
  ReceiptReturnProductOperation,
  ReceiptSendProductOperation,
} from '../../../../_libs/database/operations'
import {
  PaymentItemRepository,
  ReceiptItemRepository,
} from '../../../../_libs/database/repositories'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ReceiptPaymentMoneyBody } from './request'

@Injectable()
export class ApiReceiptAction {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly paymentItemRepository: PaymentItemRepository,
    private readonly receiptSendProductOperation: ReceiptSendProductOperation,
    private readonly receiptCloseOperation: ReceiptCloseOperation,
    private readonly receiptReturnProductOperation: ReceiptReturnProductOperation,
    private readonly receiptReopenOperation: ReceiptReopenOperation,
    private readonly distributorPaymentOperation: DistributorPaymentOperation,
    private readonly distributorRefundOperation: DistributorRefundOperation
  ) { }

  async destroy(params: { oid: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, receiptId } = params
    await this.receiptRepository.destroy({ oid, receiptId })
    return { data: { receiptId } }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    userId: number
    receiptId: number
    body: ReceiptPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId, body } = params

    const sendProductResult = await this.receiptSendProductOperation.sendProduct({
      oid,
      userId,
      receiptId,
      time: Date.now(),
    })

    const paymentItemCreatedList: PaymentItem[] = []
    if (body.money > 0) {
      const prepaymentResult = await this.distributorPaymentOperation.startPayment({
        cashierId: userId,
        distributorId: body.distributorId,
        note: 'Đóng phiếu',
        oid,
        paymentItemData: {
          moneyTopUpAdd: 0,
          payDebt: [],
          prepayment: {
            receiptId,
            itemList: [
              {
                amount: body.money,
                receiptItemId: 0,
                voucherItemType: PaymentVoucherItemType.Other,
                paymentInteractId: 0,
              },
            ],
          },
        },
        paymentMethodId: body.paymentMethodId,
        reason: body.reason,
        totalMoney: body.money,
        time: Date.now(),
      })
      paymentItemCreatedList.push(...prepaymentResult.paymentItemCreatedList)
    }

    const closeResult = await this.receiptCloseOperation.startClose({
      oid,
      userId,
      receiptId,
      time: Date.now(),
      note: 'Đóng phiếu',
    })
    paymentItemCreatedList.push(...closeResult.paymentItemCreatedList)

    if (closeResult.distributorModified) {
      this.socketEmitService.distributorUpsert(oid, {
        distributor: closeResult.distributorModified,
      })
    }
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: sendProductResult.productList || [],
    })
    this.socketEmitService.batchListChange(oid, {
      batchUpsertedList: sendProductResult.batchList || [],
    })

    return {
      data: {
        receiptModified: closeResult.receiptModified,
        distributorModified: closeResult.distributorModified,
        paymentItemCreatedList,
      },
    }
  }

  async sendProduct(params: {
    oid: number
    userId: number
    receiptId: number
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params

    const sendProductResult = await this.receiptSendProductOperation.sendProduct({
      oid,
      userId,
      receiptId,
      time: Date.now(),
    })

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: sendProductResult.productList || [],
    })
    this.socketEmitService.batchListChange(oid, {
      batchUpsertedList: sendProductResult.batchList || [],
    })
    return { data: { receiptModified: sendProductResult.receipt } }
  }

  async close(params: { oid: number; userId: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params

    const closeResult = await this.receiptCloseOperation.startClose({
      oid,
      userId,
      receiptId,
      time: Date.now(),
      note: '',
    })
    if (closeResult.distributorModified) {
      this.socketEmitService.distributorUpsert(oid, {
        distributor: closeResult.distributorModified,
      })
    }
    return {
      data: {
        receiptModified: closeResult.receiptModified,
        paymentItemCreatedList: closeResult.paymentItemCreatedList,
        distributorModified: closeResult.distributorModified,
      },
    }
  }

  async terminate(params: {
    oid: number
    userId: number
    receiptId: number
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params
    const time = Date.now()
    let distributorModified: Distributor

    const receiptOrigin = await this.receiptRepository.findOneBy({ oid, id: receiptId })
    const paymentItemCreatedList: PaymentItem[] = []

    if ([ReceiptStatus.Completed, ReceiptStatus.Debt].includes(receiptOrigin.status)) {
      const reopenResult = await this.receiptReopenOperation.reopen({
        oid,
        userId,
        time,
        receiptId,
        note: 'Hủy phiếu',
      })
      distributorModified = reopenResult.distributorModified
      paymentItemCreatedList.push(...reopenResult.paymentItemCreatedList)
    }
    if (receiptOrigin.paid > 0) {
      const refundResult = await this.distributorRefundOperation.startRefund({
        oid,
        cashierId: userId,
        time,
        receiptId,
        paymentMethodId: 0,
        money: receiptOrigin.paid,
        note: 'Hủy phiếu',
        distributorId: receiptOrigin.distributorId,
        reason: '',
      })
      distributorModified = refundResult.distributor
      paymentItemCreatedList.push(refundResult.paymentItemCreated)
    }

    if (receiptOrigin.deliveryStatus === DeliveryStatus.Delivered) {
      const returnResult = await this.receiptReturnProductOperation.returnAllProduct({
        oid,
        receiptId,
        time: Date.now(),
      })
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnResult.productList || [],
      })
      this.socketEmitService.batchListChange(oid, {
        batchUpsertedList: returnResult.batchList || [],
      })
    }

    if (distributorModified) {
      this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    }

    const receiptModified = await this.receiptRepository.updateOneAndReturnEntity(
      { oid, id: receiptId, deliveryStatus: DeliveryStatus.Pending },
      { status: ReceiptStatus.Cancelled }
    )

    return { data: { receiptModified, paymentItemCreatedList, distributorModified } }
  }
}
