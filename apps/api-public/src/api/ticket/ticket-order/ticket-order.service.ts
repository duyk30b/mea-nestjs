import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { Customer, Payment, TicketProduct } from '../../../../../_libs/database/entities'
import { PaymentActionType } from '../../../../../_libs/database/entities/payment.entity'
import Ticket, { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  TicketCloseOperation,
  TicketPaymentOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketSendProductAndPaymentBody } from '../ticket-action/request'
import { TicketDestroyService } from '../ticket-action/ticket-destroy.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDepositedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderDraftUpdateBody,
} from './request'
import { TicketOrderBasicUpsertService } from './service/ticket-order-basic-upsert.service'

@Injectable()
export class TicketOrderService {
  constructor(
    private socketEmitService: SocketEmitService,
    private cacheDataService: CacheDataService,
    private ticketDestroyService: TicketDestroyService,
    private ticketRepository: TicketRepository,
    private ticketCloseOperation: TicketCloseOperation,
    private ticketReopenOperation: TicketReopenOperation,
    private ticketPaymentOperation: TicketPaymentOperation,
    private ticketOrderBasicUpsertService: TicketOrderBasicUpsertService,
    private ticketReturnProductOperation: TicketReturnProductOperation,
    private ticketSendProductOperation: TicketSendProductOperation
  ) { }

  async draftInsert(params: { oid: number; userId: number; body: TicketOrderDraftInsertBody }) {
    const { oid, body, userId } = params

    const result = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId: '',
      customerId: body.customerId,
      body,
    })
    this.socketEmitService.socketRoomTicketPaginationChange(oid, { roomId: result.ticket.roomId })
    return { ticketCreated: result.ticket }
  }

  async draftUpdate(params: {
    oid: number
    ticketId: string
    userId: number
    body: TicketOrderDraftUpdateBody
  }) {
    const { oid, body, ticketId, userId } = params

    const result = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId,
      customerId: 0, // không truyền customerId vì không cho sửa
      body,
    })

    return { ticketModified: result.ticket }
  }

  async depositedUpdate(params: {
    oid: number
    ticketId: string
    userId: number
    body: TicketOrderDepositedUpdateBody
  }) {
    const { oid, body, ticketId, userId } = params

    const result = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId,
      customerId: 0, // không truyền customerId vì không cho sửa
      body,
    })

    return { ticketModified: result.ticket }
  }

  async debtSuccessCreate(props: {
    oid: number
    userId: number
    body: TicketOrderDebtSuccessInsertBody
  }) {
    const { oid, body, userId } = props

    const { ticket: ticketCreated } = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId: '',
      customerId: body.customerId,
      body,
    })

    const { paidTotal } = body
    const debtTotal = ticketCreated.totalMoney - paidTotal
    const time = body.ticketOrderBasic.createdAt
    const ticketId = ticketCreated.id
    const customerId = ticketCreated.customerId

    let ticketModified: Ticket
    let customer: Customer

    if (body.ticketOrderProductBodyList.length) {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const sendProductResult = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        sendType: 'ALL',
        time,
        allowNegativeQuantity,
      })
      ticketModified = sendProductResult.ticketModified || ticketModified
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: sendProductResult.productModifiedList,
        batchUpsertedList: sendProductResult.batchModifiedList,
      })
    }

    if (paidTotal > 0 || debtTotal > 0) {
      const prepaymentResult = await this.ticketPaymentOperation.startPaymentMoney({
        oid,
        ticketId,
        userId,
        walletId: body.walletId,
        hasPaymentItem: 0,
        paidTotal,
        debtTotal,
        time,
        note: '',
        paymentActionType: paidTotal > 0 ? PaymentActionType.PaymentMoney : PaymentActionType.Debit,
      })
      customer = prepaymentResult.customerModified || customer
      ticketModified = prepaymentResult.ticketModified || ticketModified
    }

    const closeResult = await this.ticketCloseOperation.startClose({
      oid,
      ticketId,
      time,
      userId,
    })
    ticketModified = closeResult.ticketModified || ticketModified

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
    })
    this.socketEmitService.customerUpsert(oid, { customer })

    return { ticketCreated: ticketModified }
  }

  async debtSuccessUpdate(params: {
    oid: number
    ticketId: string
    userId: number
    body: TicketOrderDebtSuccessUpdateBody
  }) {
    const { oid, ticketId, userId, body } = params
    const paidUpdate = body.paidTotal
    const debtUpdate = body.ticketOrderBasic.totalMoney - paidUpdate
    const time = body.ticketOrderBasic.createdAt

    let customerModified: Customer
    let ticketModified: Ticket

    const ticketOrigin = await this.ticketRepository.findOneBy({ oid, id: ticketId })
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketOrigin.status)) {
      const responseReopen = await this.ticketReopenOperation.reopen({
        oid,
        ticketId,
      })
      ticketModified = responseReopen.ticketModified
    }

    const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
      oid,
      ticketId,
      time: Date.now(),
      returnType: 'ALL',
    })
    ticketModified = returnProductResult.ticketModified || ticketModified

    const updateResult = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId,
      customerId: 0, // không truyền customerId vì không cho sửa
      body,
    })
    const customerId = updateResult.ticket.customerId

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResult = await this.ticketSendProductOperation.sendProduct({
      oid,
      ticketId,
      sendType: 'ALL',
      time,
      allowNegativeQuantity,
    })

    ticketModified = sendProductResult.ticketModified || ticketModified

    if ([TicketStatus.Draft, TicketStatus.Schedule].includes(ticketModified.status)) {
      return { data: { ticketId } }
    }
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketModified.status)) {
      const responseReopen = await this.ticketReopenOperation.reopen({ oid, ticketId })
      ticketModified = responseReopen.ticketModified
    }

    if (ticketModified.paidTotal != paidUpdate || ticketModified.debtTotal != debtUpdate) {
      const paymentResult = await this.ticketPaymentOperation.startPaymentMoney({
        oid,
        ticketId,
        userId,
        walletId: body.walletId,
        time,
        note: 'Sửa đơn',
        paymentActionType: PaymentActionType.PaymentMoney,
        hasPaymentItem: 0,
        paidTotal: paidUpdate - ticketModified.paidTotal,
        debtTotal: debtUpdate - ticketModified.debtTotal,
      })
      customerModified = paymentResult.customerModified || customerModified
      ticketModified = paymentResult.ticketModified
    }

    const closeResult = await this.ticketCloseOperation.startClose({
      oid,
      ticketId,
      time,
      userId,
    })
    ticketModified = closeResult.ticketModified

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
    })
    this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: [
        ...returnProductResult.productModifiedList,
        ...sendProductResult.productModifiedList,
      ],
      batchUpsertedList: [
        ...returnProductResult.batchModifiedList,
        ...sendProductResult.batchModifiedList,
      ],
    })
    return { ticketModified }
  }

  // ================= ACTION ================= //
  async destroy(params: { oid: number; ticketId: string }) {
    const { oid, ticketId } = params
    await this.ticketDestroyService.destroy({ oid, ticketId })
    return { ticketId }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    ticketId: string
    userId: number
    body: TicketSendProductAndPaymentBody
  }) {
    const { oid, ticketId, body, userId } = params
    const time = Date.now()
    let ticketModified: Ticket
    let customerModified: Customer
    const paymentCreatedList: Payment[] = []

    let ticketProductModifiedAll: TicketProduct[]
    if (body.ticketProductIdList.length) {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const sendProductResult = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        sendType: 'ALL',
        time,
        allowNegativeQuantity,
      })
      ticketModified = sendProductResult.ticketModified || ticketModified
      ticketProductModifiedAll = sendProductResult.ticketProductModifiedAll
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: sendProductResult.productModifiedList,
        batchUpsertedList: sendProductResult.batchModifiedList,
      })
    }

    if (body.paidAmount > 0) {
      const prepaymentResult = await this.ticketPaymentOperation.startPaymentMoney({
        oid,
        ticketId,
        userId,
        walletId: body.walletId,
        time,
        paymentActionType: PaymentActionType.PaymentMoney,
        hasPaymentItem: 0,
        paidTotal: body.paidAmount,
        debtTotal: 0,
        note: '',
      })
      ticketModified = prepaymentResult.ticketModified || ticketModified
      customerModified = prepaymentResult.customerModified || customerModified
      paymentCreatedList.push(prepaymentResult.paymentCreated)
    }

    const closeResult = await this.ticketCloseOperation.startClose({
      oid,
      ticketId,
      time,
      userId,
    })
    ticketModified = closeResult.ticketModified
    if (closeResult.paymentCreated) {
      paymentCreatedList.push(closeResult.paymentCreated)
    }

    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    this.socketEmitService.customerUpsert(oid, { customer: customerModified })

    return {
      ticketModified: closeResult.ticketModified,
      paymentCreatedList,
      ticketProductModifiedAll: ticketProductModifiedAll || [],
    }
  }
}
