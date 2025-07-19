import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MoneyDirection } from '../../../../_libs/database/entities/payment-item.entity'
import {
  PaymentInsertType,
  PaymentPersonType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerPaymentOperation,
  DistributorPaymentOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerPaymentBody,
  DistributorPaymentBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
} from './request'

@Injectable()
export class ApiPaymentActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerPaymentOperation: CustomerPaymentOperation,
    private readonly distributorPaymentOperation: DistributorPaymentOperation
  ) { }

  async sumMoney(oid: number, query: PaymentGetManyQuery): Promise<BaseResponse> {
    const { filter } = query
    const aggregateRaw = await this.paymentRepository.findAndSelect({
      condition: {
        oid,
        paymentMethodId: filter?.paymentMethodId,
        paymentPersonType: filter?.paymentPersonType,
        personId: filter?.personId,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
        createdAt: filter?.createdAt,
      },
      select: ['moneyDirection'],
      aggregate: {
        sumPaidAmount: { SUM: ['money'] },
        count: { COUNT: '*' },
      },
      groupBy: ['moneyDirection'],
    })
    const aggregate = aggregateRaw.map((i) => {
      return {
        moneyDirection: i.moneyDirection,
        sumPaidAmount: Number(i.sumPaidAmount),
        count: Number(i.count),
      }
    })
    return { data: { aggregate } }
  }

  async customerPayment(oid: number, body: CustomerPaymentBody): Promise<BaseResponse> {
    const { customer } = await this.customerPaymentOperation.startPayment({
      oid,
      customerId: body.customerId,
      cashierId: body.cashierId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      totalMoney: body.totalMoney,
      reason: body.reason,
      note: body.note,
      paymentItemData: body.paymentItemData,
    })
    this.socketEmitService.customerUpsert(oid, { customer })
    return { data: { customer } }
  }

  async distributorPayment(oid: number, body: DistributorPaymentBody): Promise<BaseResponse> {
    const { distributor } = await this.distributorPaymentOperation.startPayment({
      oid,
      distributorId: body.distributorId,
      cashierId: body.cashierId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      totalMoney: body.totalMoney,
      reason: body.reason,
      note: body.note,
      paymentItemData: body.paymentItemData,
    })
    this.socketEmitService.distributorUpsert(oid, { distributor })
    return { data: { distributor } }
  }

  async otherPaymentMoneyIn(options: {
    oid: number
    userId: number
    body: OtherPaymentBody
  }): Promise<BaseResponse> {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      paymentMethodId: body.paymentMethodId,
      paymentPersonType: PaymentPersonType.Other,
      personId: 0,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,

      money: body.money,
      debtAmount: 0,
      closeDebt: 0,
      openDebt: 0,
      cashierId: userId,
      note: body.note || '',
      reason: body.reason,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return {
      data: { payment },
    }
  }

  async otherPaymentMoneyOut(options: {
    oid: number
    userId: number
    body: OtherPaymentBody
  }): Promise<BaseResponse> {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      paymentMethodId: body.paymentMethodId,
      paymentPersonType: PaymentPersonType.Other,
      personId: 0,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,

      money: body.money,
      debtAmount: 0,
      closeDebt: 0,
      openDebt: 0,
      cashierId: userId,
      note: body.note || '',
      reason: body.reason,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return {
      data: { payment },
    }
  }
}
