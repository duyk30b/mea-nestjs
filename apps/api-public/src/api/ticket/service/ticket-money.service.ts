import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  TicketChangeDiscountOperation,
  TicketPayDebtOperation,
  TicketPrepaymentOperation,
  TicketRefundOverpaidOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketClinicChangeDiscountBody, TicketPaymentMoneyBody } from '../request'

@Injectable()
export class TicketMoneyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundOverpaidOperation,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation
  ) { }

  async prepayment(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket, payment } = await this.ticketPrepaymentOperation.prepayment({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket, payment } = await this.ticketRefundMoneyOperation.refundOverpaid({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
        description: '',
      })
      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const payDebtResult = await this.ticketPayDebtOperation.payDebt({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })
      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: payDebtResult.ticket,
      })
      if (payDebtResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: payDebtResult.customer })
      }
      return { data: { ticket: payDebtResult.ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async changeDiscount(params: {
    oid: number
    ticketId: number
    body: TicketClinicChangeDiscountBody
  }) {
    const { oid, ticketId, body } = params
    try {
      const { ticket } = await this.ticketChangeDiscountOperation.changeDiscount({
        oid,
        ticketId,
        discountType: body.discountType,
        discountMoney: body.discountMoney,
        discountPercent: body.discountPercent,
      })
      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })

      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
