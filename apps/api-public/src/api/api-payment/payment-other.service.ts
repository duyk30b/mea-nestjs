import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../_libs/database/common/error'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  PurchaseOrderRepository,
  TicketRepository,
  WalletRepository,
} from '../../../../_libs/database/repositories'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { OtherPaymentBody, PaymentUpdateInfoBody } from './request'

@Injectable()
export class PaymentOtherService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly walletRepository: WalletRepository
  ) { }

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

    let walletOpenMoney = paymentOrigin.walletOpenMoney
    let walletCloseMoney = paymentOrigin.walletCloseMoney
    if (body.walletId !== paymentOrigin.walletId) {
      const moneyTransfer = paymentOrigin.paidTotal
      if (moneyTransfer) {
        if (paymentOrigin.walletId && paymentOrigin.walletId !== '0') {
          const walletOldModified = await this.walletRepository.updateOneAndReturnEntity(
            { oid, id: paymentOrigin.walletId },
            { money: () => `money - ${moneyTransfer}` }
          )
          const paymentInsert: PaymentInsertType = {
            oid,
            voucherType: PaymentVoucherType.Other,
            voucherId: '0',
            personType: PaymentPersonType.Other,
            personId: 0,

            cashierId: userId,
            walletId: paymentOrigin.walletId,
            createdAt: time,
            moneyDirection: MoneyDirection.Other,
            paymentActionType: PaymentActionType.Other,
            note: body.note || 'Sửa phương thức thanh toán',

            hasPaymentItem: 0,
            paidTotal: 0,
            debtTotal: 0,
            personOpenDebt: 0,
            personCloseDebt: 0,
            walletOpenMoney: walletOldModified.money + moneyTransfer,
            walletCloseMoney: walletOldModified.money,
          }
          const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
        }
        if (body.walletId && body.walletId !== '0') {
          const walletNewModified = await this.walletRepository.updateOneAndReturnEntity(
            { oid, id: body.walletId },
            { money: () => `money + ${moneyTransfer}` }
          )
          walletCloseMoney = walletNewModified.money
          walletOpenMoney = walletNewModified.money - moneyTransfer
        }
      }
    }
    const payment = await this.paymentRepository.updateOneAndReturnEntity(
      { oid, id: paymentId, cashierId: userId }, // chỉ sửa phiếu do chính mình tạo ra
      {
        createdAt: body.createdAt,
        note: body.note,
        walletId: body.walletId,
        walletOpenMoney,
        walletCloseMoney,
      }
    )
    return { payment }
  }

  async createMoneyOut(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options

    let walletOpenMoney = 0
    let walletCloseMoney = 0
    if (body.walletId) {
      const walletModified = await this.walletRepository.updateOneAndReturnEntity(
        { oid, id: body.walletId },
        { money: () => `money - ${body.paidAmount}` }
      )
      walletCloseMoney = walletModified.money
      walletOpenMoney = walletModified.money + body.paidAmount
    }

    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: '0',
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      walletId: body.walletId || '0',
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,
      paymentActionType: PaymentActionType.Other,
      note: body.note || '',

      hasPaymentItem: 0,
      paidTotal: -body.paidAmount,
      debtTotal: 0,
      personOpenDebt: 0,
      personCloseDebt: 0,
      walletOpenMoney,
      walletCloseMoney,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }

  async createMoneyIn(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options

    let walletOpenMoney = 0
    let walletCloseMoney = 0
    if (body.walletId) {
      const walletModified = await this.walletRepository.updateOneAndReturnEntity(
        { oid, id: body.walletId },
        { money: () => `money + ${body.paidAmount}` }
      )
      walletCloseMoney = walletModified.money
      walletOpenMoney = walletModified.money - body.paidAmount
    }
    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: '0',
      personType: PaymentPersonType.Other,
      personId: 0,

      cashierId: userId,
      walletId: body.walletId || '0',
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,
      paymentActionType: PaymentActionType.Other,
      note: body.note || '',

      hasPaymentItem: 0,
      paidTotal: body.paidAmount,
      debtTotal: 0,
      personOpenDebt: 0,
      personCloseDebt: 0,
      walletOpenMoney,
      walletCloseMoney,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }

  async destroy(options: { oid: number; userId: number; paymentId: string }) {
    const { oid, userId, paymentId } = options
    const payment = await this.paymentRepository.findOneBy({ oid, id: paymentId })
    if (payment.cashierId !== userId) {
      throw new BusinessError('Không được phép xóa phiếu thanh toán của nhân viên khác tạo')
    }
    if (payment.voucherType === PaymentVoucherType.Ticket) {
      const ticket = await this.ticketRepository.findOneBy({
        oid,
        id: payment.voucherId,
      })
      if (ticket) {
        throw new BusinessError('Không được phép xóa phiếu thanh toán của khách hàng')
      }
    }
    if (payment.voucherType === PaymentVoucherType.PurchaseOrder) {
      const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
        oid,
        id: payment.voucherId,
      })
      if (purchaseOrder) {
        throw new BusinessError('Không được phép xóa phiếu thanh toán của nhà cung cấp')
      }
    }
    await this.paymentRepository.deleteAndReturnEntity({
      oid,
      id: paymentId,
      cashierId: userId, // chỉ được xóa phiếu do chính mình tạo ra
    })
  }
}
