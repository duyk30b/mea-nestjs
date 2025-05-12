import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { VoucherType } from '../../../../_libs/database/entities/payment.entity'
import { ReceiptStatus } from '../../../../_libs/database/entities/receipt.entity'
import {
  ReceiptPayDebtOperation,
  ReceiptPaymentAndCloseOperation,
  ReceiptPrepaymentOperation,
  ReceiptRefundOverpaidOperation,
  ReceiptReopenOperation,
  ReceiptReturnProductOperation,
  ReceiptSendProductOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository } from '../../../../_libs/database/repositories'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ReceiptPaymentMoneyBody } from './request'

@Injectable()
export class ApiReceiptAction {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptRefundOverpaidOperation: ReceiptRefundOverpaidOperation,
    private readonly receiptPayDebtOperation: ReceiptPayDebtOperation,
    private readonly paymentRepository: PaymentRepository,
    private readonly receiptSendProductOperation: ReceiptSendProductOperation,
    private readonly receiptPaymentAndCloseOperation: ReceiptPaymentAndCloseOperation,
    private readonly receiptPrepaymentOperation: ReceiptPrepaymentOperation,
    private readonly receiptReturnProductOperation: ReceiptReturnProductOperation,
    private readonly receiptReopenOperation: ReceiptReopenOperation
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
    try {
      const sendProductResult = await this.receiptSendProductOperation.sendProduct({
        oid,
        userId,
        receiptId,
        time: Date.now(),
      })

      const { receipt, payment } = await this.receiptPaymentAndCloseOperation.paymentAndClose({
        oid,
        cashierId: userId,
        receiptId,
        time: Date.now(),
        paymentMethodId: body.paymentMethodId,
        money: body.money,
        note: '',
        description: '',
      })

      return { data: { receipt, payment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(params: {
    oid: number
    userId: number
    receiptId: number
    body: ReceiptPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId, body } = params
    try {
      const { receipt, payment } = await this.receiptPrepaymentOperation.prepayment({
        oid,
        cashierId: userId,
        receiptId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
      })
      return { data: { receipt, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProduct(params: {
    oid: number
    userId: number
    receiptId: number
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params
    try {
      const { receipt } = await this.receiptSendProductOperation.sendProduct({
        oid,
        userId,
        receiptId,
        time: Date.now(),
      })

      return { data: { receipt } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(params: {
    oid: number
    userId: number
    receiptId: number
    body: ReceiptPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId, body } = params

    const { receipt, payment } = await this.receiptRefundOverpaidOperation.refundOverpaid({
      oid,
      cashierId: userId,
      receiptId,
      time: Date.now(),
      money: body.money,
      paymentMethodId: body.paymentMethodId,
      note: '',
      description: '',
    })

    return { data: { receipt, payment } }
  }

  async close(params: { oid: number; userId: number; receiptId: number }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params

    const { receipt, payment } = await this.receiptPaymentAndCloseOperation.paymentAndClose({
      oid,
      cashierId: userId,
      receiptId,
      time: Date.now(),
      paymentMethodId: 0,
      money: 0,
      note: '',
      description: '',
    })

    return { data: { receipt, payment } }
  }

  async payDebt(params: {
    oid: number
    userId: number
    receiptId: number
    body: ReceiptPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId, body } = params
    try {
      const { distributor, receipt, payment } = await this.receiptPayDebtOperation.payDebt({
        oid,
        cashierId: userId,
        receiptId,
        time: Date.now(),
        paymentMethodId: body.paymentMethodId,
        money: body.money,
      })
      if (distributor) {
        this.socketEmitService.distributorUpsert(oid, { distributor })
      }
      return { data: { receipt, payment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async terminate(params: {
    oid: number
    userId: number
    receiptId: number
  }): Promise<BaseResponse> {
    const { oid, userId, receiptId } = params
    const time = Date.now()
    const receiptOrigin = await this.receiptRepository.findOneBy({ oid, id: receiptId })
    if ([ReceiptStatus.Completed, ReceiptStatus.Debt].includes(receiptOrigin.status)) {
      await this.receiptReopenOperation.reopen({
        oid,
        cashierId: userId,
        time,
        receiptId,
        paymentMethodId: 0,
        newPaid: 0,
        description: 'Hủy phiếu',
        note: '',
      })
    }
    if ([ReceiptStatus.Deposited, ReceiptStatus.Executing].includes(receiptOrigin.status)) {
      if (receiptOrigin.paid > 0) {
        await this.receiptRefundOverpaidOperation.refundOverpaid({
          oid,
          cashierId: userId,
          time,
          receiptId,
          paymentMethodId: 0,
          money: receiptOrigin.paid,
          description: 'Hủy phiếu',
          note: '',
        })
      }
    }

    if (receiptOrigin.deliveryStatus === DeliveryStatus.Delivered) {
      await this.receiptReturnProductOperation.returnAllProduct({
        oid,
        receiptId,
        time: Date.now(),
      })
    }

    const receipt = await this.receiptRepository.updateOneAndReturnEntity(
      { oid, id: receiptId, deliveryStatus: DeliveryStatus.Pending, paid: 0 },
      { status: ReceiptStatus.Cancelled }
    )
    const paymentList = await this.paymentRepository.findMany({
      condition: {
        oid,
        voucherType: VoucherType.Receipt,
        voucherId: receiptId,
      },
      sort: { id: 'ASC' },
    })
    return { data: { receipt, paymentList } }
  }
}
