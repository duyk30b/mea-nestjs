import { TicketPaymentMoneyBasicBody } from '@api-public/api/ticket/ticket-action/request'
import { CacheDataService } from '@libs/common/cache-data/cache-data.service'
import { TicketActionType } from '@libs/database/common/variable'
import { Customer } from '@libs/database/entities'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import PaymentTicket, {
  PaymentTicketInsertType,
} from '@libs/database/entities/payment_ticket.entity'
import Ticket, { TicketStatus } from '@libs/database/entities/ticket.entity'
import {
  TicketChangeDebtOperation,
  TicketOpenCloseOperation,
  TicketPaymentMoneyOperation,
  TicketReturnProductOperation,
  TicketShipProductOperation,
} from '@libs/database/operations'
import { TicketRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketCancelService } from '../ticket-action/ticket-cancel.service'
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
    private ticketCancelService: TicketCancelService,
    private ticketRepository: TicketRepository,
    private ticketOrderBasicUpsertService: TicketOrderBasicUpsertService,
    private ticketReturnProductOperation: TicketReturnProductOperation,
    private ticketShipProductOperation: TicketShipProductOperation,
    private ticketPaymentMoneyOperation: TicketPaymentMoneyOperation,
    private ticketChangeDebtOperation: TicketChangeDebtOperation,
    private ticketOpenCloseOperation: TicketOpenCloseOperation
  ) {}

  async draftInsert(params: { oid: number; userId: number; body: TicketOrderDraftInsertBody }) {
    const { oid, body, userId } = params

    const result = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId: '',
      customerId: body.customerId,
      body,
    })
    this.socketEmitService.socketTicketPaginationChange(oid, { roomId: result.ticket.roomId })
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
      const shipProductResult = await this.ticketShipProductOperation.startShip({
        oid,
        ticketId,
        shipType: 'ALL',
        time,
        allowNegativeQuantity,
      })
      ticketModified = shipProductResult.ticketModified || ticketModified
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: shipProductResult.productModifiedList,
        batchUpsertedList: shipProductResult.batchModifiedList,
      })
    }

    if (paidTotal > 0) {
      const prepaymentResult = await this.ticketPaymentMoneyOperation.startPaymentMoney({
        oid,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType: PaymentActionType.PaymentMoney,
        ticketActionType: TicketActionType.TicketOrderDebtSuccessCreate,
        time,
        note: '',
        paidTotal,
        ticketId,
        isPaymentEachItem: 0,
      })
      customer = prepaymentResult.customerModified || customer
      ticketModified = prepaymentResult.ticketModified || ticketModified
    }
    if (debtTotal > 0) {
      const prepaymentResult = await this.ticketChangeDebtOperation.startChangeDebt({
        oid,
        customerId,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType: PaymentActionType.Debit,
        time,
        note: '',
        changeDebtList: [
          {
            ticketId,
            paid: 0,
            debt: debtTotal,
            ticketActionType: TicketActionType.TicketOrderDebtSuccessCreate,
          },
        ],
      })
      customer = prepaymentResult.customerModified || customer
      ticketModified = prepaymentResult.ticketModifiedList[0]
    }

    const closeResult = await this.ticketOpenCloseOperation.startClose({
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
      const responseReopen = await this.ticketOpenCloseOperation.reopen({ oid, ticketId })
      ticketModified = responseReopen.ticketModified
    }

    const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
      oid,
      ticketId,
      time: Date.now(),
      returnType: 'ALL',
      options: { changePendingIfNoStock: false },
    })
    ticketModified = returnProductResult.ticketModified || ticketModified

    const updateItemResult = await this.ticketOrderBasicUpsertService.startUpsert({
      oid,
      ticketId,
      customerId: 0, // không truyền customerId vì không cho sửa
      body,
    })
    const customerId = updateItemResult.ticket.customerId

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const shipProductResult = await this.ticketShipProductOperation.startShip({
      oid,
      ticketId,
      shipType: 'ALL',
      time,
      allowNegativeQuantity,
    })

    ticketModified = shipProductResult.ticketModified || ticketModified

    if ([TicketStatus.Draft, TicketStatus.Schedule].includes(ticketModified.status)) {
      return { data: { ticketId } }
    }

    if (ticketModified.paidTotal != paidUpdate) {
      const paymentResult = await this.ticketPaymentMoneyOperation.startPaymentMoney({
        oid,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType:
          paidUpdate > ticketModified.paidTotal
            ? PaymentActionType.PaymentMoney
            : PaymentActionType.RefundMoney,
        time,
        note: '',
        paidTotal: paidUpdate - ticketModified.paidTotal,
        ticketId,
        ticketActionType: TicketActionType.TicketOrderDebtSuccessUpdate,
        isPaymentEachItem: 0,
      })
      customerModified = paymentResult.customerModified || customerModified
      ticketModified = paymentResult.ticketModified
    }
    if (ticketModified.debtTotal != debtUpdate) {
      const paymentResult = await this.ticketChangeDebtOperation.startChangeDebt({
        oid,
        customerId,
        cashierId: userId,
        walletId: body.walletId,
        time,
        note: '',
        paymentActionType:
          debtUpdate > ticketModified.debtTotal
            ? PaymentActionType.Debit
            : PaymentActionType.RefundDebt,

        changeDebtList: [
          {
            ticketId,
            paid: 0,
            debt: debtUpdate - ticketModified.debtTotal,
            ticketActionType: TicketActionType.TicketOrderDebtSuccessUpdate,
          },
        ],
      })
      customerModified = paymentResult.customerModified || customerModified
      ticketModified = paymentResult.ticketModifiedList[0] || ticketModified
    }

    const closeResult = await this.ticketOpenCloseOperation.startClose({
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
        ...(returnProductResult.productModifiedList || []),
        ...(shipProductResult.productModifiedList || []),
      ],
      batchUpsertedList: [
        ...(returnProductResult.batchModifiedList || []),
        ...(shipProductResult.batchModifiedList || []),
      ],
    })
    return { ticketModified }
  }

  // ================= ACTION ================= //
  async destroy(params: { oid: number; ticketId: string }) {
    const { oid, ticketId } = params
    await this.ticketCancelService.destroy({ oid, ticketId })
    return { ticketId }
  }

  async shipProductAndPaymentAndClose(params: {
    oid: number
    ticketId: string
    userId: number
    body: TicketPaymentMoneyBasicBody
  }) {
    const { oid, ticketId, body, userId } = params
    const time = Date.now()
    let ticketModified: Ticket
    let customerModified: Customer
    const paymentTicketCreatedList: PaymentTicket[] = []

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const shipProductResult = await this.ticketShipProductOperation.startShip({
      oid,
      ticketId,
      shipType: 'ALL',
      time,
      allowNegativeQuantity,
    })
    ticketModified = shipProductResult.ticketModified || ticketModified
    const ticketProductModifiedAll = shipProductResult.ticketProductModifiedAll

    if (body.paidAmount > 0) {
      const prepaymentResult = await this.ticketPaymentMoneyOperation.startPaymentMoney({
        oid,
        cashierId: userId,
        walletId: body.walletId,
        paymentActionType: PaymentActionType.PaymentMoney,
        time,
        note: '',
        paidTotal: body.paidAmount,
        ticketId,
        ticketActionType: TicketActionType.ShipProductAndPaymentAndClose,
        isPaymentEachItem: 0,
      })
      ticketModified = prepaymentResult.ticketModified || ticketModified
      customerModified = prepaymentResult.customerModified || customerModified
      paymentTicketCreatedList.push(...(prepaymentResult.paymentTicketCreatedList || []))
    }

    const debtFix = ticketModified.totalMoney - ticketModified.paidTotal
    if (debtFix != 0) {
      const changeDebtResult = await this.ticketChangeDebtOperation.startChangeDebt({
        oid,
        customerId: ticketModified.customerId,
        cashierId: userId,
        walletId: '0',
        time,
        note: '',
        paymentActionType: PaymentActionType.Debit,
        changeDebtList: [
          {
            ticketId,
            paid: 0,
            debt: debtFix,
            ticketActionType: TicketActionType.ShipProductAndPaymentAndClose,
          },
        ],
      })
      ticketModified = changeDebtResult.ticketModifiedList[0]
      customerModified = changeDebtResult.customerModified
      paymentTicketCreatedList.push(
        ...(changeDebtResult.paymentTicketCreatedList || []).filter((item) => {
          return item.ticketId === ticketId
        })
      )
    }

    const closeResult = await this.ticketOpenCloseOperation.startClose({
      oid,
      ticketId,
      time,
      userId,
    })
    ticketModified = closeResult.ticketModified

    if (customerModified) {
      ticketModified.customer = customerModified
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    this.socketEmitService.productListChange(oid, {
      productUpsertedList: shipProductResult.productModifiedList,
      batchUpsertedList: shipProductResult.batchModifiedList,
    })
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketProduct: { upsertedList: ticketProductModifiedAll || [] },
      paymentTicketCreatedList: paymentTicketCreatedList || [],
    })

    return {
      ticketModified,
      ticketProductModifiedAll: ticketProductModifiedAll || undefined,
    }
  }
}
