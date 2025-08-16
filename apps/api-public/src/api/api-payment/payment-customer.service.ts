import { Injectable } from '@nestjs/common'
import {
  CustomerPayDebtOperation,
  CustomerPrepaymentMoneyOperation,
  CustomerPrepaymentTicketItemListOperation,
  CustomerRefundMoneyOperation,
  CustomerRefundTicketItemListOperation,
} from '../../../../_libs/database/operations'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerPayDebtBody,
  CustomerPrepaymentBody,
  CustomerPrepaymentTicketItemListBody,
  CustomerRefundMoneyBody,
  CustomerRefundTicketItemListBody,
  PaymentPostQuery,
} from './request'

@Injectable()
export class PaymentCustomerService {
  customerPaymentOperation: any
  customerRefundOperation: any
  distributorPaymentOperation: any
  distributorRefundOperation: any
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly customerPayDebtOperation: CustomerPayDebtOperation,
    private readonly customerPrepaymentMoneyOperation: CustomerPrepaymentMoneyOperation,
    private readonly customerPrepaymentTicketItemListOperation: CustomerPrepaymentTicketItemListOperation,
    private readonly customerRefundMoneyOperation: CustomerRefundMoneyOperation,
    private readonly customerRefundTicketItemListOperation: CustomerRefundTicketItemListOperation
  ) { }

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
}
