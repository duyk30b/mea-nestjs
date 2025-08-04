import { Injectable } from '@nestjs/common'
import { PaymentMoneyStatus } from '../../../../_libs/database/common/variable'
import { Customer, Payment, TicketProduct } from '../../../../_libs/database/entities'
import Ticket, { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketOrderDepositedOperation,
  TicketOrderDraftOperation,
} from '../../../../_libs/database/operations'
import { TicketRepository } from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { PaymentActionService } from '../api-payment/payment-action.service'
import { TicketSendProductAndPaymentBody } from '../ticket/request'
import { TicketActionService } from '../ticket/service/ticket-action.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDepositedUpdateBody,
  TicketOrderDraftUpsertBody,
} from './request'

@Injectable()
export class ApiTicketOrderService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketOrderDraftOperation: TicketOrderDraftOperation,
    private readonly ticketOrderDepositedOperation: TicketOrderDepositedOperation,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketActionService: TicketActionService,
    private readonly paymentActionService: PaymentActionService
  ) { }

  async draftUpsert(params: { oid: number; userId: number; body: TicketOrderDraftUpsertBody }) {
    const { oid, body, userId } = params

    const { ticket } = await this.ticketOrderDraftOperation.upsert({
      oid,
      ticketId: body.ticketId,
      ticketOrderDraftUpsertDto: {
        ...body.ticketOrderDraftUpsert,
        customType: 0,
        roomId: 0,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        commissionMoney: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftListDto: body.ticketOrderProductDraftList.map((i) => {
        return {
          ...i,
          printPrescription: 1,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
          createdAt: body.ticketOrderDraftUpsert.registeredAt,
        }
      }),
      ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList.map((i) => {
        return {
          ...i,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
        }
      }),
      ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
      // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
    })
    return { data: { ticket } }
  }

  async depositedUpdate(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDepositedUpdateBody
  }) {
    const { oid, userId, ticketId, body } = params

    const { ticket } = await this.ticketOrderDepositedOperation.update({
      oid,
      ticketId,
      ticketOrderDepositedUpdateDto: {
        ...body.ticketOrderDepositedUpdate,
        customType: 0,
        roomId: 0,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        commissionMoney: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftListDto: body.ticketOrderProductDraftList.map((i) => {
        return {
          ...i,
          printPrescription: 1,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
          createdAt: body.ticketOrderDepositedUpdate.registeredAt,
        }
      }),
      ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList.map((i) => {
        return {
          ...i,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
        }
      }),
      ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
      // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
    })
    return { data: { ticket } }
  }

  async debtSuccessCreate(params: {
    oid: number
    userId: number
    body: TicketOrderDebtSuccessInsertBody
  }) {
    const { oid, body, userId } = params
    const { paid, ...ticketOrderDraftInsertBody } = body.ticketOrderDebtSuccessInsert
    const time = ticketOrderDraftInsertBody.registeredAt

    const draftResponse = await this.ticketOrderDraftOperation.upsert({
      oid,
      ticketId: 0,
      ticketOrderDraftUpsertDto: {
        ...ticketOrderDraftInsertBody,
        customType: 0,
        roomId: 0,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        commissionMoney: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftListDto: body.ticketOrderProductDraftList.map((i) => {
        return {
          ...i,
          printPrescription: 1,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
          createdAt: body.ticketOrderDebtSuccessInsert.registeredAt,
        }
      }),
      ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList.map((i) => {
        return {
          ...i,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
        }
      }),
      ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
      // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
    })

    const ticketId = draftResponse.ticket.id
    const customerId = draftResponse.ticket.customerId

    if (body.ticketOrderProductDraftList.length) {
      await this.ticketActionService.sendProduct({
        oid,
        ticketId,
        ticketProductIdList: draftResponse.ticket.ticketProductList || [].map((i) => i.id),
        sendAll: true,
      })
    }

    if (paid > 0) {
      await this.paymentActionService.customerPrepaymentMoney({
        oid,
        userId,
        body: { ticketId, customerId, paymentMethodId: 0, paidAmount: paid, note: '' },
      })
    }

    const closeResult = await this.ticketActionService.close({ oid, userId, ticketId })

    return { data: { ticket: closeResult.ticketModified } }
  }

  async debtSuccessUpdate(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDebtSuccessUpdateBody
  }) {
    const { oid, userId, ticketId, body } = params
    const time = Date.now()
    let ticket = await this.ticketRepository.findOneBy({ oid, id: ticketId })
    const customerId = ticket.customerId

    if ([TicketStatus.Draft, TicketStatus.Schedule].includes(ticket.status)) {
      return { data: { ticketId } }
    }
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticket.status)) {
      const responseReopen = await this.ticketActionService.reopen({
        oid,
        ticketId,
        userId,
      })
      ticket = responseReopen.ticketModified
    }
    if (ticket.paid) {
      await this.paymentActionService.customerRefundMoney({
        oid,
        userId,
        body: {
          customerId,
          note: 'Sửa đơn',
          paymentMethodId: 0,
          refundAmount: ticket.paid,
          ticketId,
        },
      })
    }
    await this.ticketActionService.returnProduct({
      oid,
      returnAll: true,
      ticketId,
      returnList: [],
    })

    const { paid: paidBody, ...ticketBodyUpdate } = body.ticketOrderDebtSuccessUpdate
    // không update paid, giữ nguyên số tiền trước update, trả paid thêm vào ở dưới cùng
    const responseUpdate = await this.ticketOrderDepositedOperation.update({
      oid,
      ticketId,
      ticketOrderDepositedUpdateDto: {
        ...ticketBodyUpdate,
        customType: 0,
        roomId: 0,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        commissionMoney: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftListDto: body.ticketOrderProductDraftList.map((i) => {
        return {
          ...i,
          printPrescription: 1,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
          createdAt: body.ticketOrderDebtSuccessUpdate.registeredAt,
        }
      }),
      ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList.map((i) => {
        return {
          ...i,
          paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
        }
      }),
      ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
    })
    ticket = responseUpdate.ticket

    const responseSendAllProduct = await this.ticketActionService.sendProduct({
      ticketId,
      oid,
      sendAll: true,
      ticketProductIdList: responseUpdate.ticket.ticketProductList.map((i) => i.id),
    })

    if (paidBody > 0) {
      await this.paymentActionService.customerPrepaymentMoney({
        oid,
        userId,
        body: { ticketId, customerId, paymentMethodId: 0, paidAmount: paidBody, note: 'Sửa đơn' },
      })
    }

    await this.ticketActionService.close({
      oid,
      ticketId,
      userId,
    })

    return { data: { ticketId } }
  }

  // ================= ACTION ================= //

  async destroy(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    await this.ticketRepository.destroy({ oid, ticketId })
    return { ticketId }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    ticketId: number
    userId: number
    body: TicketSendProductAndPaymentBody
  }) {
    const { oid, ticketId, body, userId } = params
    const time = Date.now()
    const paymentCreatedList: Payment[] = []
    let ticketModified: Ticket
    let customerModified: Customer

    let ticketProductModifiedAll: TicketProduct[]
    if (body.ticketProductIdList.length) {
      const sendProductResult = await this.ticketActionService.sendProduct({
        oid,
        sendAll: true,
        ticketId,
        ticketProductIdList: [],
        options: { noEmitTicket: true },
      })
      if (sendProductResult.ticketModified) {
        ticketModified = sendProductResult.ticketModified
      }
      ticketProductModifiedAll = sendProductResult.ticketProductModifiedAll
    }

    const customerId = body.customerId

    if (body.paidAmount > 0) {
      const prepaymentResult = await this.paymentActionService.customerPrepaymentMoney({
        oid,
        userId,
        body: {
          customerId,
          note: body.note,
          paidAmount: body.paidAmount,
          paymentMethodId: body.paymentMethodId,
          ticketId,
        },
      })
      paymentCreatedList.push(prepaymentResult.paymentCreated)
      ticketModified = prepaymentResult.ticketModified
    }

    const closeResult = await this.ticketActionService.close({
      oid,
      ticketId,
      userId,
      options: { noEmitCustomer: true, noEmitTicket: true },
    })
    paymentCreatedList.push(...closeResult.paymentCreatedList)
    if (closeResult.ticketModified) {
      ticketModified = closeResult.ticketModified
    }
    if (closeResult.customerModified) {
      customerModified = closeResult.customerModified
    }
    if (ticketModified) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }
    if (customerModified) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    return {
      ticketModified: closeResult.ticketModified,
      paymentCreatedList,
      ticketProductModifiedAll: ticketProductModifiedAll || [],
    }
  }
}
