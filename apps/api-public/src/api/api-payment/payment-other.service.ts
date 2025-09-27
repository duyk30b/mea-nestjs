import { Injectable } from '@nestjs/common'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import {
  OtherPaymentBody,
} from './request'

@Injectable()
export class PaymentOtherService {
  customerPaymentOperation: any
  customerRefundOperation: any
  distributorPaymentOperation: any
  distributorRefundOperation: any
  constructor(
    private readonly paymentRepository: PaymentRepository

  ) { }

  async createMoneyOut(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: '0',
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,
      paymentActionType: PaymentActionType.Other,
      note: body.note || '',

      paidAmount: body.paidAmount,
      debtAmount: 0,
      openDebt: 0,
      closeDebt: 0,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }

  async createMoneyIn(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: '0',
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,
      paymentActionType: PaymentActionType.Other,
      note: body.note || '',

      paidAmount: body.paidAmount,
      debtAmount: 0,
      openDebt: 0,
      closeDebt: 0,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }

  async destroyMoneyOut(options: { oid: number; userId: number; paymentId: string }) {
    const { oid, userId, paymentId } = options
    const payment = await this.paymentRepository.deleteAndReturnEntity({
      oid,
      id: paymentId,
      cashierId: userId, // chỉ được xóa phiếu do chính mình tạo ra
      voucherId: '0',
      moneyDirection: MoneyDirection.Out,
      debtAmount: 0,
    })
    return { payment }
  }

  async destroyMoneyIn(options: { oid: number; userId: number; paymentId: string }) {
    const { oid, userId, paymentId } = options
    const payment = await this.paymentRepository.deleteAndReturnEntity({
      oid,
      id: paymentId,
      cashierId: userId, // chỉ được xóa phiếu do chính mình tạo ra
      voucherId: '0',
      moneyDirection: MoneyDirection.In,
      debtAmount: 0,
    })
    return { payment }
  }
}
