import { BusinessError } from '@libs/database/common/error'
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
    const time = Date.now()

    const paymentOrigin = await this.paymentRepository.findOneBy({ oid, id: paymentId })
    if (paymentOrigin.cashierId !== userId) {
      throw new BusinessError('Không được sửa phiếu thanh toán do tài khoản khác tạo phiếu')
    }

    let walletOpenMoneyUpdate = paymentOrigin.walletOpenMoney
    let walletCloseMoneyUpdate = paymentOrigin.walletCloseMoney
    if (body.walletId !== paymentOrigin.walletId) {
      const moneyTransfer = paymentOrigin.paidTotal
      if (moneyTransfer) {
        if (paymentOrigin.walletId && paymentOrigin.walletId !== '0') {
          const walletOldModified = await this.walletRepository.updateOne(
            { oid, id: paymentOrigin.walletId },
            { money: () => `money - ${moneyTransfer}` }
          )
          const paymentReplaceInsert: PaymentInsertType = {
            oid,
            personType: PaymentPersonType.Other,
            personId: 0,

            cashierId: userId,
            walletId: paymentOrigin.walletId,
            createdAt: paymentOrigin.createdAt,
            moneyDirection: MoneyDirection.Other,
            paymentActionType: PaymentActionType.FixWallet,
            note: body.note || 'Sửa phương thức thanh toán',

            paidTotal: 0,
            debtTotal: 0,
            personOpenDebt: 0,
            personCloseDebt: 0,
            walletOpenMoney: paymentOrigin.walletOpenMoney,
            walletCloseMoney: paymentOrigin.walletCloseMoney,
          }

          const paymentFixInsert: PaymentInsertType = {
            oid,
            personType: PaymentPersonType.Other,
            personId: 0,

            cashierId: userId,
            walletId: paymentOrigin.walletId,
            createdAt: time,
            moneyDirection: MoneyDirection.Other,
            paymentActionType: PaymentActionType.FixWallet,
            note: body.note || 'Sửa phương thức thanh toán',

            paidTotal: 0,
            debtTotal: 0,
            personOpenDebt: 0,
            personCloseDebt: 0,
            walletOpenMoney: walletOldModified.money + moneyTransfer,
            walletCloseMoney: walletOldModified.money,
          }
          await this.paymentRepository.insertMany([paymentReplaceInsert, paymentFixInsert])
        }
        if (body.walletId && body.walletId !== '0') {
          const walletNewModified = await this.walletRepository.updateOne(
            { oid, id: body.walletId },
            { money: () => `money + ${moneyTransfer}` }
          )
          walletCloseMoneyUpdate = walletNewModified.money
          walletOpenMoneyUpdate = walletNewModified.money - moneyTransfer
        }
      }
    }
    const payment = await this.paymentRepository.updateOne(
      { oid, id: paymentId, cashierId: userId }, // chỉ sửa phiếu do chính mình tạo ra
      {
        createdAt: body.createdAt,
        note: body.note,
        walletId: body.walletId,
        walletOpenMoney: walletOpenMoneyUpdate,
        walletCloseMoney: walletCloseMoneyUpdate,
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
