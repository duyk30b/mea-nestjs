import { Injectable } from '@nestjs/common'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentPersonType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerPaymentOperation,
  CustomerRefundOperation,
  DistributorPaymentOperation,
  DistributorRefundOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerPaymentBody,
  DistributorPaymentBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPostQuery,
} from './request'
import { CustomerRefundBody } from './request/customer-refund.body'
import { DistributorRefundBody } from './request/distributor-refund.body'

@Injectable()
export class PaymentActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerPaymentOperation: CustomerPaymentOperation,
    private readonly distributorPaymentOperation: DistributorPaymentOperation,
    private readonly customerRefundOperation: CustomerRefundOperation,
    private readonly distributorRefundOperation: DistributorRefundOperation
  ) { }

  async sumMoney(oid: number, query: PaymentGetManyQuery) {
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
    return { aggregate }
  }

  async customerPayment(data: {
    oid: number
    userId: number
    body: CustomerPaymentBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean; noEmitCustomer?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const paymentResult = await this.customerPaymentOperation.startPayment({
      oid,
      customerId: body.customerId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      totalMoney: body.totalMoney,
      reason: body.reason,
      note: body.note,
      paymentItemData: body.paymentItemData,
    })
    const { ticketModifiedList, customerModified, paymentCreated, paymentItemCreatedList } =
      paymentResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: ticketModifiedList })
    }
    if (!options?.noEmitCustomer) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    if (paymentResult.ticketProcedureModifiedList) {
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId: body.paymentItemData.prepayment?.ticketId || 0,
        ticketProcedureUpsertList: paymentResult.ticketProcedureModifiedList,
      })
    }
    if (paymentResult.ticketProductConsumableModifiedList) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId: body.paymentItemData.prepayment?.ticketId || 0,
        ticketProductUpsertList: paymentResult.ticketProductConsumableModifiedList,
      })
    }
    if (paymentResult.ticketProductPrescriptionModifiedList) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId: body.paymentItemData.prepayment?.ticketId || 0,
        ticketProductUpsertList: paymentResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (paymentResult.ticketLaboratoryModifiedList) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId: body.paymentItemData.prepayment?.ticketId || 0,
        ticketLaboratoryUpsertList: paymentResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: paymentResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (paymentResult.ticketRadiologyModifiedList) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId: body.paymentItemData.prepayment?.ticketId || 0,
        ticketRadiologyUpsertList: paymentResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModifiedList, customerModified, paymentCreated, paymentItemCreatedList }
  }

  async customerRefund(params: { oid: number; userId: number; body: CustomerRefundBody }) {
    const { oid, userId, body } = params
    const refundResult = await this.customerRefundOperation.startRefund({
      oid,
      cashierId: userId,
      customerId: body.customerId,
      ticketId: body.ticketId,
      time: Date.now(),
      totalMoney: body.totalMoney,
      paymentMethodId: body.paymentMethodId,
      reason: body.reason,
      note: 'Hoàn trả',
      refundItemList: body.refundItemList,
    })
    const { ticketModified, customer, paymentCreated, paymentItemCreatedList } = refundResult
    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    if (refundResult.ticketProcedureModifiedList) {
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProcedureUpsertList: refundResult.ticketProcedureModifiedList,
      })
    }
    if (refundResult.ticketProductConsumableModifiedList) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProductUpsertList: refundResult.ticketProductConsumableModifiedList,
      })
    }
    if (refundResult.ticketProductPrescriptionModifiedList) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProductUpsertList: refundResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (refundResult.ticketLaboratoryModifiedList) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketLaboratoryUpsertList: refundResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: refundResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (refundResult.ticketRadiologyModifiedList) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketRadiologyUpsertList: refundResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModified, customer, paymentCreated, paymentItemCreatedList }
  }

  async distributorPayment(options: { oid: number; userId: number; body: DistributorPaymentBody }) {
    const { oid, body, userId } = options
    const paymentResult = await this.distributorPaymentOperation.startPayment({
      oid,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      totalMoney: body.totalMoney,
      reason: body.reason,
      note: body.note,
      paymentItemData: body.paymentItemData,
    })
    const { distributorModified, receiptModifiedList, paymentItemCreatedList } = paymentResult
    this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    this.socketEmitService.socketReceiptListChange(oid, {
      receiptUpsertedList: receiptModifiedList,
    })
    return { distributorModified, receiptModifiedList, paymentItemCreatedList }
  }

  async distributorRefund(params: { oid: number; userId: number; body: DistributorRefundBody }) {
    const { oid, userId, body } = params
    const refundResult = await this.distributorRefundOperation.startRefund({
      oid,
      cashierId: userId,
      distributorId: body.distributorId,
      receiptId: body.receiptId,
      time: Date.now(),
      money: body.money,
      paymentMethodId: body.paymentMethodId,
      reason: body.reason,
      note: 'Hoàn trả',
    })
    const { distributor, receiptModified, paymentItemCreated } = refundResult
    this.socketEmitService.socketReceiptListChange(oid, {
      receiptUpsertedList: [receiptModified],
    })
    return { receiptModified, distributor, paymentItemCreated }
  }

  async otherPaymentMoneyIn(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      paymentMethodId: body.paymentMethodId,
      paymentPersonType: PaymentPersonType.Other,
      personId: 0,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.In,

      money: body.money,
      cashierId: userId,
      note: body.note || '',
      reason: body.reason,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }

  async otherPaymentMoneyOut(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      paymentMethodId: body.paymentMethodId,
      paymentPersonType: PaymentPersonType.Other,
      personId: 0,
      createdAt: Date.now(),
      moneyDirection: MoneyDirection.Out,

      money: body.money,
      cashierId: userId,
      note: body.note || '',
      reason: body.reason,
    }
    const payment = await this.paymentRepository.insertOneAndReturnEntity(paymentInsert)
    return { payment }
  }
}
