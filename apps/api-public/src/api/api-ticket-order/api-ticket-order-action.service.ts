import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketPayDebt } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { TicketOrderCancel } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-cancel'
import { TicketOrderRefundOverpaid } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-refund-overpaid'
import { TicketOrderReturnProductList } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-return-product-list'
import { CacheDataService } from '../../../../_libs/transporter/cache-manager/cache-data.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketOrderPaymentBody } from './request-action/ticket-order-payment.body'
import { TicketOrderReturnProductListBody } from './request-action/ticket-order-return-product-list.body'

@Injectable()
export class ApiTicketOrderActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPrepayment: TicketPrepayment,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly ticketPayDebt: TicketPayDebt,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketOrderRefundOverpaid: TicketOrderRefundOverpaid,
    private readonly ticketOrderCancel: TicketOrderCancel,
    private readonly ticketOrderReturnProductList: TicketOrderReturnProductList
  ) { }

  async prepayment(options: {
    oid: number
    ticketId: number
    body: TicketOrderPaymentBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = options
    try {
      const { ticketBasic, customerPayment } = await this.ticketPrepayment.prepayment({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })

      return { data: { ticketBasic, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    ticketId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, ticketId, money } = params
    const time = Date.now()
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { productList, batchList } = await this.ticketSendProduct.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      const { ticketBasic, customer, customerPayment } =
        await this.ticketPaymentAndClose.paymentAndClose({
          oid,
          ticketId,
          time,
          money,
        })
      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic, customerPayment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async paymentAndClose(params: {
    oid: number
    ticketId: number
    money: number
  }): Promise<BaseResponse> {
    const { oid, ticketId, money } = params
    const time = Date.now()
    try {
      const { ticketBasic, customer, customerPayment } =
        await this.ticketPaymentAndClose.paymentAndClose({
          oid,
          ticketId,
          time,
          money,
        })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic, customerPayment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(options: {
    oid: number
    ticketId: number
    body: TicketOrderPaymentBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = options
    try {
      const { ticketBasic, customerPayment } = await this.ticketOrderRefundOverpaid.refundOverpaid({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })

      return { data: { ticketBasic, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { ticketBasic, productList, batchList } = await this.ticketSendProduct.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      return { data: { ticketBasic } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketOrderReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const { ticketBasic, productList, batchList, customer, customerPayment } =
        await this.ticketOrderReturnProductList.returnProductList({
          oid,
          ticketId,
          time: Date.now(),
          returnList: body.returnList,
          discountMoneyReturn: body.discountMoneyReturn,
          surchargeReturn: body.surchargeReturn,
          debtReturn: body.debtReturn,
          paidReturn: body.paidReturn,
          description: 'Trả hàng',
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic, customerPayment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(options: {
    oid: number
    ticketId: number
    body: TicketOrderPaymentBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = options
    try {
      const { ticketBasic, customerPayment, customer } = await this.ticketPayDebt.payDebt({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async cancel(options: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = options

    const { ticketBasic, customerPayment, customer } = await this.ticketOrderCancel.cancel({
      oid,
      ticketId,
      time: Date.now(),
      description: 'Hủy phiếu',
    })
    if (customer) {
      this.socketEmitService.customerUpsert(oid, { customer })
    }
    return { data: { ticketBasic, customerPayment } }
  }
}
