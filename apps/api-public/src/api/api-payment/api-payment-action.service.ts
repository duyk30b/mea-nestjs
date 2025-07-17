import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerPaymentOperation,
  DistributorPaymentOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerPaymentBody,
  CustomerPaymentCommonBody,
  DistributorPaymentBody,
  OtherPaymentBody,
} from './request'

@Injectable()
export class ApiPaymentActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerPaymentOperation: CustomerPaymentOperation,
    private readonly distributorPaymentOperation: DistributorPaymentOperation
  ) { }

  async customerPaymentMoneyIn(oid: number, body: CustomerPaymentBody): Promise<BaseResponse> {
    const { customer } = await this.customerPaymentOperation.startPayment({
      oid,
      customerId: body.customerId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      ticketPaymentList: body.ticketPaymentList,
      note: body.note,
      money: body.money,
      cashierId: body.cashierId,
    })
    this.socketEmitService.customerUpsert(oid, { customer })
    return { data: { customer } }
  }

  async customerPaymentCommon(oid: number, body: CustomerPaymentCommonBody): Promise<BaseResponse> {
    const { customer, ticketModifiedList } = await this.customerPaymentOperation.paymentCommon({
      oid,
      customerId: body.customerId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      note: body.note,
      cashierId: body.cashierId,
      paymentData: {
        moneyTopUp: body.moneyTopUp,
        payDebtTicketList: body.payDebtTicketList,
        prepaymentTicketList: body.prepaymentTicketList,
      },
    })
    this.socketEmitService.customerUpsert(oid, { customer })
    if (ticketModifiedList.length) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: ticketModifiedList })
    }
    return { data: { customer } }
  }

  async distributorPaymentMoneyOut(
    oid: number,
    body: DistributorPaymentBody
  ): Promise<BaseResponse> {
    const { distributor } = await this.distributorPaymentOperation.startPayment({
      oid,
      distributorId: body.distributorId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      receiptPaymentList: body.receiptPaymentList,
      note: body.note,
      money: body.money,
      cashierId: body.cashierId,
    })
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
      voucherType: VoucherType.Unknown,
      voucherId: 0,
      personType: PersonType.Unknown,
      personId: 0,
      paymentTiming: PaymentTiming.Other,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,
      paidAmount: body.money,
      debtAmount: 0,
      openDebt: 0,
      closeDebt: 0,
      cashierId: userId,
      note: body.note || '',
      description: '',
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
      voucherType: VoucherType.Unknown,
      voucherId: 0,
      personType: PersonType.Unknown,
      personId: 0,
      paymentTiming: PaymentTiming.Other,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,
      paidAmount: body.money,
      debtAmount: 0,
      openDebt: 0,
      closeDebt: 0,
      cashierId: userId,
      note: body.note || '',
      description: '',
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return {
      data: { payment },
    }
  }
}
