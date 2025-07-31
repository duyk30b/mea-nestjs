import { Injectable } from '@nestjs/common'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerPayDebtOperation,
  CustomerPrepaymentMoneyOperation,
  CustomerPrepaymentTicketItemListOperation,
  CustomerRefundMoneyOperation,
  CustomerRefundTicketItemListOperation,
  DistributorPayDebtOperation,
  DistributorPrepaymentMoneyOperation,
  DistributorRefundMoneyOperation,
} from '../../../../_libs/database/operations'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerPayDebtBody,
  CustomerPrepaymentBody,
  CustomerPrepaymentTicketItemListBody,
  CustomerRefundMoneyBody,
  CustomerRefundTicketItemListBody,
  DistributorPayDebtBody,
  DistributorPrepaymentBody,
  DistributorRefundMoneyBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPostQuery,
} from './request'

@Injectable()
export class PaymentActionService {
  customerPaymentOperation: any
  customerRefundOperation: any
  distributorPaymentOperation: any
  distributorRefundOperation: any
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerPayDebtOperation: CustomerPayDebtOperation,
    private readonly customerPrepaymentMoneyOperation: CustomerPrepaymentMoneyOperation,
    private readonly customerPrepaymentTicketItemListOperation: CustomerPrepaymentTicketItemListOperation,
    private readonly customerRefundMoneyOperation: CustomerRefundMoneyOperation,
    private readonly customerRefundTicketItemListOperation: CustomerRefundTicketItemListOperation,
    private readonly distributorPayDebtOperation: DistributorPayDebtOperation,
    private readonly distributorPrepaymentMoneyOperation: DistributorPrepaymentMoneyOperation,
    private readonly distributorRefundMoneyOperation: DistributorRefundMoneyOperation
  ) { }

  async sumMoney(oid: number, query: PaymentGetManyQuery) {
    const { filter } = query
    const aggregateRaw = await this.paymentRepository.findAndSelect({
      condition: {
        oid,
        paymentMethodId: filter?.paymentMethodId,
        personType: filter?.personType,
        personId: filter?.personId,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
        createdAt: filter?.createdAt,
      },
      select: ['moneyDirection'],
      aggregate: {
        sumPaidAmount: { SUM: ['paidAmount'] },
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

  async customerPrepaymentMoney(data: {
    oid: number
    userId: number
    body: CustomerPrepaymentBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const prepaymentResult = await this.customerPrepaymentMoneyOperation.startPrePaymentMoney({
      oid,
      ticketId: body.ticketId,
      customerId: body.customerId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
    })
    const { ticketModified, customer, paymentCreated } = prepaymentResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }

    return { ticketModified, customer, paymentCreated }
  }

  async customerPayDebt(data: {
    oid: number
    userId: number
    body: CustomerPayDebtBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean; noEmitCustomer?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.customerPayDebtOperation.startPayDebt({
      oid,
      customerId: body.customerId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
      dataList: body.dataList,
    })
    const { ticketModifiedList, customerModified, paymentCreatedList } = payDebtResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: ticketModifiedList })
    }
    if (!options?.noEmitCustomer) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }

    return { ticketModifiedList, customerModified, paymentCreatedList }
  }

  async customerRefundMoney(data: {
    oid: number
    userId: number
    body: CustomerRefundMoneyBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.customerRefundMoneyOperation.startRefundMoney({
      oid,
      ticketId: body.ticketId,
      customerId: body.customerId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      refundAmount: body.refundAmount,
      note: body.note,
    })
    const { ticketModified, customer, paymentCreated } = payDebtResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }

    return { ticketModified, customer, paymentCreated }
  }

  async distributorPrepaymentMoney(data: {
    oid: number
    userId: number
    body: DistributorPrepaymentBody
    query?: PaymentPostQuery
    options?: { noEmitReceipt?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const prepaymentResult = await this.distributorPrepaymentMoneyOperation.startPrePaymentMoney({
      oid,
      receiptId: body.receiptId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
    })
    const { receiptModified, distributor, paymentCreated } = prepaymentResult
    if (!options?.noEmitReceipt) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: [receiptModified],
      })
    }

    return { receiptModified, distributor, paymentCreated }
  }

  async distributorPayDebt(data: {
    oid: number
    userId: number
    body: DistributorPayDebtBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean; noEmitDistributor?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.distributorPayDebtOperation.startPayDebt({
      oid,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      paidAmount: body.paidAmount,
      note: body.note,
      dataList: body.dataList,
    })
    const { receiptModifiedList, distributorModified, paymentCreatedList } = payDebtResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: receiptModifiedList,
      })
    }
    if (!options?.noEmitDistributor) {
      this.socketEmitService.distributorUpsert(oid, { distributor: distributorModified })
    }

    return { receiptModifiedList, distributorModified, paymentCreatedList }
  }

  async distributorRefundMoney(data: {
    oid: number
    userId: number
    body: DistributorRefundMoneyBody
    query?: PaymentPostQuery
    options?: { noEmitReceipt?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const payDebtResult = await this.distributorRefundMoneyOperation.startRefundMoney({
      oid,
      receiptId: body.receiptId,
      distributorId: body.distributorId,
      cashierId: userId,
      paymentMethodId: body.paymentMethodId,
      time: Date.now(),
      refundAmount: body.refundAmount,
      note: body.note,
    })
    const { receiptModified, distributor, paymentCreated } = payDebtResult
    if (!options?.noEmitReceipt) {
      this.socketEmitService.socketReceiptListChange(oid, {
        receiptUpsertedList: [receiptModified],
      })
    }

    return { receiptModified, distributor, paymentCreated }
  }

  async customerPrepaymentTicketItemList(data: {
    oid: number
    userId: number
    body: CustomerPrepaymentTicketItemListBody
    query?: PaymentPostQuery
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, userId, body, options } = data
    const prepaymentResult =
      await this.customerPrepaymentTicketItemListOperation.startPrepaymentTicketItemList({
        oid,
        ticketId: body.ticketId,
        customerId: body.customerId,
        cashierId: userId,
        paymentMethodId: body.paymentMethodId,
        time: Date.now(),
        note: body.note,
        paidAmount: body.paidAmount,
        ticketItemList: body.ticketItemList,
      })
    const { ticketModified, customer, paymentCreated } = prepaymentResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }

    if (prepaymentResult.ticketProcedureModifiedList?.length) {
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId: body.ticketId,
        ticketProcedureUpsertList: prepaymentResult.ticketProcedureModifiedList,
      })
    }
    if (prepaymentResult.ticketProductConsumableModifiedList?.length) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId: body.ticketId,
        ticketProductUpsertList: prepaymentResult.ticketProductConsumableModifiedList,
      })
    }
    if (prepaymentResult.ticketProductPrescriptionModifiedList?.length) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId: body.ticketId,
        ticketProductUpsertList: prepaymentResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (prepaymentResult.ticketLaboratoryModifiedList?.length) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId: body.ticketId,
        ticketLaboratoryUpsertList: prepaymentResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: prepaymentResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (prepaymentResult.ticketRadiologyModifiedList?.length) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId: body.ticketId,
        ticketRadiologyUpsertList: prepaymentResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModified, customer, paymentCreated }
  }

  async customerRefundTicketItemList(params: {
    oid: number
    userId: number
    body: CustomerRefundTicketItemListBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, userId, body, options } = params
    const refundResult = await this.customerRefundTicketItemListOperation.startRefundTicketItemList(
      {
        oid,
        ticketId: body.ticketId,
        customerId: body.customerId,
        cashierId: userId,
        paymentMethodId: body.paymentMethodId,
        time: Date.now(),
        refundAmount: body.refundAmount,
        note: body.note,
        ticketItemList: body.ticketItemList,
      }
    )
    const { ticketModified, customer, paymentCreated } = refundResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }

    if (refundResult.ticketProcedureModifiedList?.length) {
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProcedureUpsertList: refundResult.ticketProcedureModifiedList,
      })
    }
    if (refundResult.ticketProductConsumableModifiedList?.length) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProductUpsertList: refundResult.ticketProductConsumableModifiedList,
      })
    }
    if (refundResult.ticketProductPrescriptionModifiedList?.length) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId: body.ticketId || 0,
        ticketProductUpsertList: refundResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (refundResult.ticketLaboratoryModifiedList?.length) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketLaboratoryUpsertList: refundResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: refundResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (refundResult.ticketRadiologyModifiedList?.length) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId: body.ticketId || 0,
        ticketRadiologyUpsertList: refundResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModified, customer, paymentCreated }
  }

  async otherPaymentMoneyIn(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: 0,
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

  async otherPaymentMoneyOut(options: { oid: number; userId: number; body: OtherPaymentBody }) {
    const { oid, userId, body } = options
    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Other,
      voucherId: 0,
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
}
