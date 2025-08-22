import { Injectable } from '@nestjs/common'
import {
  CustomerPayDebtOperation,
  CustomerPrepaymentMoneyOperation,
  CustomerPrepaymentTicketItemListOperation,
  CustomerRefundMoneyOperation,
  CustomerRefundTicketItemListOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  CustomerPayDebtBody,
  CustomerPrepaymentBody,
  CustomerPrepaymentTicketItemListBody,
  CustomerRefundMoneyBody,
  CustomerRefundTicketItemListBody,
} from './request'

@Injectable()
export class TicketMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly customerPayDebtOperation: CustomerPayDebtOperation,
    private readonly customerPrepaymentMoneyOperation: CustomerPrepaymentMoneyOperation,
    private readonly customerPrepaymentTicketItemListOperation: CustomerPrepaymentTicketItemListOperation,
    private readonly customerRefundMoneyOperation: CustomerRefundMoneyOperation,
    private readonly customerRefundTicketItemListOperation: CustomerRefundTicketItemListOperation
  ) { }

  async prepaymentMoney(data: {
    oid: number
    ticketId: number
    userId: number
    body: CustomerPrepaymentBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, userId, body, options } = data
    const prepaymentResult = await this.customerPrepaymentMoneyOperation.startPrePaymentMoney({
      oid,
      ticketId,
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

  async payDebt(data: {
    oid: number
    userId: number
    body: CustomerPayDebtBody
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

  async refundMoney(data: {
    oid: number
    ticketId: number
    userId: number
    body: CustomerRefundMoneyBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, userId, body, options } = data
    const payDebtResult = await this.customerRefundMoneyOperation.startRefundMoney({
      oid,
      ticketId,
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

  async prepaymentTicketItemList(data: {
    oid: number
    userId: number
    ticketId: number
    body: CustomerPrepaymentTicketItemListBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, userId, body, options } = data
    const prepaymentResult =
      await this.customerPrepaymentTicketItemListOperation.startPrepaymentTicketItemList({
        oid,
        ticketId,
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
        ticketId,
        ticketProcedureUpsertList: prepaymentResult.ticketProcedureModifiedList,
      })
    }
    if (prepaymentResult.ticketProductConsumableModifiedList?.length) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: prepaymentResult.ticketProductConsumableModifiedList,
      })
    }
    if (prepaymentResult.ticketProductPrescriptionModifiedList?.length) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductUpsertList: prepaymentResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (prepaymentResult.ticketLaboratoryModifiedList?.length) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: prepaymentResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: prepaymentResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (prepaymentResult.ticketRadiologyModifiedList?.length) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId,
        ticketRadiologyUpsertList: prepaymentResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModified, customer, paymentCreated }
  }

  async refundTicketItemList(params: {
    oid: number
    userId: number
    ticketId: number
    body: CustomerRefundTicketItemListBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, userId, body, options } = params
    const refundResult = await this.customerRefundTicketItemListOperation.startRefundTicketItemList(
      {
        oid,
        ticketId,
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
        ticketId,
        ticketProcedureUpsertList: refundResult.ticketProcedureModifiedList,
      })
    }
    if (refundResult.ticketProductConsumableModifiedList?.length) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: refundResult.ticketProductConsumableModifiedList,
      })
    }
    if (refundResult.ticketProductPrescriptionModifiedList?.length) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductUpsertList: refundResult.ticketProductPrescriptionModifiedList,
      })
    }
    if (refundResult.ticketLaboratoryModifiedList?.length) {
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: refundResult.ticketLaboratoryModifiedList,
        ticketLaboratoryGroupUpsertList: refundResult.ticketLaboratoryGroupModifiedList || [],
      })
    }
    if (refundResult.ticketRadiologyModifiedList?.length) {
      this.socketEmitService.socketTicketRadiologyListChange(oid, {
        ticketId,
        ticketRadiologyUpsertList: refundResult.ticketRadiologyModifiedList,
      })
    }
    return { ticketModified, customer, paymentCreated }
  }
}
