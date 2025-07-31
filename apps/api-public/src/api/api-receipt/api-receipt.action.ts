import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { Distributor, Payment } from '../../../../_libs/database/entities'
import { ReceiptStatus } from '../../../../_libs/database/entities/receipt.entity'
import {
  DistributorPrepaymentMoneyOperation,
  DistributorRefundMoneyOperation,
  ReceiptCloseOperation,
  ReceiptReopenOperation,
  ReceiptReturnProductOperation,
  ReceiptSendProductOperation,
} from '../../../../_libs/database/operations'
import { ReceiptItemRepository } from '../../../../_libs/database/repositories'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ReceiptPaymentMoneyBody } from './request'

@Injectable()
export class ApiReceiptAction {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly receiptSendProductOperation: ReceiptSendProductOperation,
    private readonly receiptCloseOperation: ReceiptCloseOperation,
    private readonly receiptReturnProductOperation: ReceiptReturnProductOperation,
    private readonly receiptReopenOperation: ReceiptReopenOperation,
    private readonly distributorPrepaymentMoneyOperation: DistributorPrepaymentMoneyOperation,
    private readonly distributorRefundMoneyOperation: DistributorRefundMoneyOperation
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

    const paymentCreatedList: Payment[] = []
    if (body.paidAmount > 0) {
      const prepaymentResult = await this.distributorPrepaymentMoneyOperation.startPrePaymentMoney({
        cashierId: userId,
        distributorId: body.distributorId,
        oid,
        receiptId,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
        paidAmount: body.paidAmount,
        time: Date.now(),
      })
      paymentCreatedList.push(prepaymentResult.paymentCreated)
    }

    const closeResult = await this.receiptCloseOperation.startClose({
      oid,
      userId,
      receiptId,
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
      productUpsertedList: sendProductResult.productList || [],
    })
    this.socketEmitService.batchListChange(oid, {
      batchUpsertedList: sendProductResult.batchList || [],
    })

    return {
      data: {
        receiptModified: closeResult.receiptModified,
        distributorModified: closeResult.distributorModified,
        paymentCreatedList,
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
        paymentCreatedList: closeResult.paymentCreatedList,
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
    const paymentCreatedList: Payment[] = []

    if ([ReceiptStatus.Completed, ReceiptStatus.Debt].includes(receiptOrigin.status)) {
      const reopenResult = await this.receiptReopenOperation.reopen({
        oid,
        userId,
        time,
        receiptId,
        note: '',
      })
      distributorModified = reopenResult.distributorModified
      paymentCreatedList.push(...reopenResult.paymentCreatedList)
    }
    if (receiptOrigin.paid > 0) {
      const refundResult = await this.distributorRefundMoneyOperation.startRefundMoney({
        oid,
        cashierId: userId,
        time,
        receiptId,
        paymentMethodId: 0,
        refundAmount: receiptOrigin.paid,
        note: 'Hủy phiếu',
        distributorId: receiptOrigin.distributorId,
      })
      distributorModified = refundResult.distributor
      paymentCreatedList.push(refundResult.paymentCreated)
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

    return { data: { receiptModified, paymentCreatedList, distributorModified } }
  }
}
