import {
  TicketChangeDebtBody,
  TicketPaymentMoneyBody,
} from '@api-public/api/ticket/ticket-money/request'
import { TicketActionType } from '@libs/database/common/variable'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { TicketChangeDebtOperation, TicketPaymentMoneyOperation } from '@libs/database/operations'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../../socket/socket-emit.service'

@Injectable()
export class TicketMoneyService {
  constructor(
    private socketEmitService: SocketEmitService,
    private ticketPaymentMoneyOperation: TicketPaymentMoneyOperation,
    private ticketChangeDebtOperation: TicketChangeDebtOperation
  ) {}

  async paymentMoney(data: {
    oid: number
    ticketId: string
    userId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, ticketId, userId, body } = data
    const paymentResult = await this.ticketPaymentMoneyOperation.startPaymentMoney({
      oid,
      cashierId: userId,
      walletId: body.walletId,
      paymentActionType: body.paymentActionType,
      time: Date.now(),
      note: body.note,
      paidTotal: body.paidTotal,
      ticketId,
      ticketActionType: body.ticketActionType,
      isPaymentEachItem: body.isPaymentEachItem,
      paymentTicketItemMap: body.paymentTicketItemMap,
    })
    const { paymentCreated, ticketModified, customerModified } = paymentResult
    ticketModified.customer = customerModified

    this.socketEmitService.socketTicketChange(oid, {
      ticketId: paymentResult.ticketModified.id,
      ticketModified: paymentResult.ticketModified,
      paymentTicketCreatedList: paymentResult.paymentTicketCreatedList,
      ticketPaymentDetailModified: paymentResult.ticketPaymentDetailModified,
      ticketRegimen: { upsertedList: paymentResult.ticketRegimentList || [] },
      ticketRegimenItem: { upsertedList: paymentResult.ticketRegimenItemModifiedList || [] },
      ticketProcedure: { upsertedList: paymentResult.ticketProcedureModifiedList },
      ticketProduct: { upsertedList: paymentResult.ticketProductModifiedList },
      ticketLaboratory: { upsertedList: paymentResult.ticketLaboratoryModifiedList },
      ticketLaboratoryGroup: { upsertedList: paymentResult.ticketLaboratoryGroupModifiedList },
      ticketRadiology: { upsertedList: paymentResult.ticketRadiologyModifiedList },
    })

    this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    return { ticketModified, paymentCreated }
  }

  async changeDebt(data: { oid: number; userId: number; body: TicketChangeDebtBody }) {
    const { oid, userId, body } = data

    const payDebtResult = await this.ticketChangeDebtOperation.startChangeDebt({
      oid,
      customerId: body.customerId,
      cashierId: userId,
      walletId: body.walletId,
      time: Date.now(),
      note: body.note,
      paymentActionType: body.paymentActionType,
      changeDebtList: body.changeDebtListBody,
    })

    const { customerModified, ticketModifiedList, paymentTicketCreatedList } = payDebtResult

    this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    ticketModifiedList.forEach((ticketModified) => {
      this.socketEmitService.socketTicketChange(oid, {
        ticketId: ticketModified.id,
        ticketModified,
        paymentTicketCreatedList: paymentTicketCreatedList.filter((paymentTicket) => {
          return paymentTicket.ticketId === ticketModified.id
        }),
      })
    })

    return { customerModified, ticketModifiedList }
  }
}
