import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BusinessError } from '../../../../_libs/database/common/error'
import { GenerateId } from '../../../../_libs/database/common/generate-id'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import { PaymentRepository } from '../../../../_libs/database/repositories'
import { WalletRepository } from '../../../../_libs/database/repositories/wallet.repository'
import {
  WalletCreateBody,
  WalletGetManyQuery,
  WalletPaginationQuery,
  WalletUpdateBody,
} from './request'

@Injectable()
export class ApiWalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async pagination(oid: number, query: WalletPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.walletRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })
    return { walletList: data, total, page, limit }
  }

  async getMany(oid: number, query: WalletGetManyQuery) {
    const { limit, filter, relation } = query

    const data = await this.walletRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { walletList: data }
  }

  async getOne(oid: number, id: string) {
    const wallet = await this.walletRepository.findOneBy({ oid, id })
    if (!wallet) throw new BusinessException('error.Database.NotFound')
    return { wallet }
  }

  async createOne(oid: number, body: WalletCreateBody) {
    const id = GenerateId.nextId()
    const code = body.code || id
    const existWallet = await this.walletRepository.findOneBy({ oid, code })
    if (existWallet) {
      throw new BusinessError(`Trùng mã thanh toán với ${existWallet.name}`)
    }

    const wallet = await this.walletRepository.insertOne({
      oid,
      id,
      ...body,
      code,
      money: 0,
    })
    return { wallet }
  }

  async updateOne(options: {
    oid: number
    userId: number
    walletId: string
    body: WalletUpdateBody
  }) {
    const { body, walletId, oid, userId } = options
    const code = body.code || walletId

    if (code) {
      const existWallet = await this.walletRepository.findOneBy({
        oid,
        code,
        id: { NOT: walletId },
      })
      if (existWallet) {
        throw new BusinessError(`Trùng mã ví với ${existWallet.name}`)
      }
    }

    const walletOrigin = await this.walletRepository.findOneBy({ oid, id: walletId })

    if (walletOrigin.money !== body.money) {
      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Other,
        voucherId: '0',
        personType: PaymentPersonType.Other,
        personId: 0,

        createdAt: Date.now(),
        walletId,
        paymentActionType: PaymentActionType.Other,
        moneyDirection: MoneyDirection.Other,
        note: 'Sửa ví',

        paid: 0,
        paidItem: 0,
        debt: 0,
        debtItem: 0,
        personOpenDebt: 0,
        personCloseDebt: 0,
        cashierId: userId,
        walletOpenMoney: walletOrigin.money,
        walletCloseMoney: body.money,
      }

      await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    }
    const wallet = await this.walletRepository.updateOneAndReturnEntity(
      { id: walletId, oid },
      { ...body, code }
    )
    return { wallet }
  }

  async destroyOne(options: { oid: number; walletId: string }) {
    const { oid, walletId } = options
    await this.walletRepository.delete({ oid, id: walletId })

    return { walletId }
  }
}
