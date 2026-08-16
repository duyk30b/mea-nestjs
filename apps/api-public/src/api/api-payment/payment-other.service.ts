import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
} from '@libs/database/entities/payment.entity'
import {
  PurchaseOrderRepository,
  TicketRepository,
  WalletRepository,
} from '@libs/database/repositories'
import { PaymentRepository } from '@libs/database/repositories/payment.repository'
import { Injectable } from '@nestjs/common'
import { OtherPaymentBody, PaymentUpdateInfoBody } from './request'

@Injectable()
export class PaymentOtherService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  async updateInfo(options: {
    oid: number
    userId: number
    paymentId: string
    body: PaymentUpdateInfoBody
  }) {
    const { oid, userId, paymentId, body } = options

    const payment = await this.paymentRepository.updateOne(
      { oid, id: paymentId, cashierId: userId }, // chỉ sửa phiếu do chính mình tạo ra
      {
        createdAt: body.createdAt,
        note: body.note,
      }
    )
    return { payment }
  }

  async createMoneyOut(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options

    let walletOpenMoney = 0
    let walletCloseMoney = 0
    if (body.walletId) {
      const walletModified = await this.walletRepository.updateOne(
        { oid, id: body.walletId },
        { money: () => `money - ${body.paidAmount}` }
      )
      walletCloseMoney = walletModified.money
      walletOpenMoney = walletModified.money + body.paidAmount
    }

    const paymentInsert: PaymentInsertType = {
      oid,
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      walletId: body.walletId || '0',
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,
      paymentActionType: PaymentActionType.UserCreate,
      note: body.note || '',

      paidTotal: -body.paidAmount,
      debtTotal: 0,
      personOpenDebt: 0,
      personCloseDebt: 0,
      walletOpenMoney,
      walletCloseMoney,
    }
    const payment = await this.paymentRepository.insertOne(paymentInsert)
    return { payment }
  }

  async createMoneyIn(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options

    let walletOpenMoney = 0
    let walletCloseMoney = 0
    if (body.walletId) {
      const walletModified = await this.walletRepository.updateOne(
        { oid, id: body.walletId },
        { money: () => `money + ${body.paidAmount}` }
      )
      walletCloseMoney = walletModified.money
      walletOpenMoney = walletModified.money - body.paidAmount
    }
    const paymentInsert: PaymentInsertType = {
      oid,
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      walletId: body.walletId || '0',
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,
      paymentActionType: PaymentActionType.UserCreate,
      note: body.note || '',

      paidTotal: body.paidAmount,
      debtTotal: 0,
      personOpenDebt: 0,
      personCloseDebt: 0,
      walletOpenMoney,
      walletCloseMoney,
    }
    const payment = await this.paymentRepository.insertOne(paymentInsert)
    return { payment }
  }

  async destroy(options: { oid: number; userId: number; paymentId: string }) {
    const { oid, userId, paymentId } = options
    await this.paymentRepository.deleteMany({
      oid,
      id: paymentId,
      cashierId: userId, // chỉ được xóa phiếu do chính mình tạo ra
      paymentActionType: PaymentActionType.UserCreate, // chỉ được xóa phiếu do chính mình tạo ra
    })
    return { success: true }
  }
}
