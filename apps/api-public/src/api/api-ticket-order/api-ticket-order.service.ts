import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketOrderDraftApprovedOperation,
  TicketOrderDraftOperation,
  TicketPayDebtOperation,
  TicketPaymentAndCloseOperation,
  TicketPrepaymentOperation,
  TicketRefundMoneyOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../_libs/database/operations'
import {
  CustomerPaymentRepository,
  TicketProductRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketReturnProductListBody } from '../api-ticket/request'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderPaymentBody,
} from './request'

@Injectable()
export class ApiTicketOrderService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketOrderDraftOperation: TicketOrderDraftOperation,
    private readonly ticketOrderDraftApprovedOperation: TicketOrderDraftApprovedOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundMoneyOperation,
    private readonly ticketReopenOperation: TicketReopenOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation,
    private readonly customerPaymentRepository: CustomerPaymentRepository
  ) { }

  async createDraft(params: {
    oid: number
    userId: number
    body: TicketOrderDraftInsertBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    try {
      const { ticket } = await this.ticketOrderDraftOperation.create({
        oid,
        ticketOrderDraftInsertDto: {
          ...body.ticketOrderDraftInsert,
          customType: 0,
          customerSourceId: 0,
          laboratoryMoney: 0,
          radiologyMoney: 0,
          dailyIndex: 0,
          commissionMoney: 0,
          imageIds: JSON.stringify([]),
        },
        ticketOrderProductDraftListDto: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
        ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraftApproved(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDraftApprovedUpdateBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket } = await this.ticketOrderDraftApprovedOperation.update({
        oid,
        ticketId,
        ticketOrderDraftApprovedUpdateDto: {
          ...body.ticketOrderDraftApprovedUpdate,
          customType: 0,
          customerSourceId: 0,
          laboratoryMoney: 0,
          radiologyMoney: 0,
          dailyIndex: 0,
          commissionMoney: 0,
          imageIds: JSON.stringify([]),
        },
        ticketOrderProductDraftListDto: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
        ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createDebtSuccess(params: {
    oid: number
    userId: number
    body: TicketOrderDebtSuccessInsertBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    const { paid, ...ticketOrderDraftInsert } = body.ticketOrderDebtSuccessInsert
    const time = ticketOrderDraftInsert.registeredAt

    const createDraftResponse = await this.ticketOrderDraftOperation.create({
      oid,
      ticketOrderDraftInsertDto: {
        ...ticketOrderDraftInsert,
        customType: 0,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        commissionMoney: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftListDto: body.ticketOrderProductDraftList,
      ticketOrderProcedureDraftListDto: body.ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftListDto: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftListDto: body.ticketOrderExpenseDraftList,
      ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
    })

    const ticketId = createDraftResponse.ticket.id

    if (body.ticketOrderProductDraftList.length) {
      const sendProductResponse = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
      })

      this.socketEmitService.productListUpdate(oid, {
        productList: sendProductResponse.productModifiedList,
      })
    }

    const { ticket, customer } = await this.ticketPaymentAndCloseOperation.paymentAndClose({
      oid,
      ticketId,
      money: paid,
      time,
    })

    if (customer) {
      this.socketEmitService.customerUpsert(oid, { customer })
    }
    return { data: { ticket } }
  }

  async prepayment(options: {
    oid: number
    ticketId: number
    body: TicketOrderPaymentBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = options
    try {
      const { ticket, customerPayment } = await this.ticketPrepaymentOperation.prepayment({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })

      return { data: { ticket, customerPayment } }
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
      const { productModifiedList } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
      })
      const { ticket, customer, customerPayment } =
        await this.ticketPaymentAndCloseOperation.paymentAndClose({
          oid,
          ticketId,
          time,
          money,
        })
      this.socketEmitService.productListUpdate(oid, { productList: productModifiedList })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true },
        condition: {
          oid,
          ticketId,
        },
        sort: { id: 'ASC' },
      })
      return { data: { ticket, ticketProductList, customerPayment } }
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
      const { ticket, customer, customerPayment } =
        await this.ticketPaymentAndCloseOperation.paymentAndClose({
          oid,
          ticketId,
          time,
          money,
        })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket, customerPayment } }
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
      const result = await this.ticketRefundMoneyOperation.refundMoney({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      let ticket = result.ticket
      const customerPayment = result.customerPayment
      if (ticket.paid === ticket.totalMoney) {
        const ticketUpdateList = await this.ticketRepository.updateAndReturnEntity(
          { oid, id: ticketId },
          { ticketStatus: TicketStatus.Completed }
        )
        ticket = ticketUpdateList[0]
      }

      return { data: { ticket, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()
    try {
      const { ticket, productModifiedList } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
      })

      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true },
        condition: {
          oid,
          ticketId,
        },
        sort: { id: 'ASC' },
      })

      this.socketEmitService.productListUpdate(oid, { productList: productModifiedList })
      return { data: { ticket, ticketProductList } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const time = Date.now()
      const promiseData = await Promise.all([
        this.ticketRepository.findOneBy({ oid, id: ticketId }),
      ])
      let ticket = promiseData[0]
      if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticket.ticketStatus)) {
        const result = await this.ticketReopenOperation.reopen({
          oid,
          ticketId,
          time,
          description: 'Hoàn trả',
        })
        ticket = result.ticket
      }

      const result = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time: Date.now(),
        tpReturnList: body.tpReturnList,
      })
      this.socketEmitService.productListUpdate(oid, { productList: result.productModifiedList })
      ticket = result.ticket

      return { data: { ticket } }
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
      const { ticket, customerPayment, customer } = await this.ticketPayDebtOperation.payDebt({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket, customerPayment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async cancel(options: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = options
    const time = Date.now()
    const promiseData = await Promise.all([
      this.ticketRepository.findOneBy({ oid, id: ticketId }),
      this.ticketProductRepository.findManyBy({ oid, ticketId }),
    ])
    let ticket = promiseData[0]
    const ticketProductList = promiseData[1]

    if ([TicketStatus.Draft, TicketStatus.Schedule].includes(ticket.ticketStatus)) {
      await this.ticketRepository.destroy({ oid, ticketId })
      return { data: { ticketId } }
    }
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticket.ticketStatus)) {
      const result = await this.ticketReopenOperation.reopen({
        oid,
        ticketId,
        time,
        description: 'Hủy phiếu',
      })
      ticket = result.ticket
    }

    const tpReturnList = ticketProductList
      .filter((i) => i.deliveryStatus === DeliveryStatus.Delivered)
      .map((i) => {
        return {
          ticketProductId: i.id,
          productId: i.productId,
          quantityReturn: i.quantity,
        }
      })
    if (tpReturnList.length) {
      const result = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time,
        tpReturnList,
      })
      ticket = result.ticket
    }

    if (ticket.paid) {
      const result = await this.ticketRefundMoneyOperation.refundMoney({
        oid,
        ticketId,
        time,
        money: ticket.paid,
      })
      ticket = result.ticket
    }

    ticket = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        ticketStatus: TicketStatus.Cancelled,
      }
    )
    const customerPaymentList = await this.customerPaymentRepository.findMany({
      condition: { oid, ticketId },
      sort: { id: 'ASC' },
    })
    return { data: { ticket, customerPaymentList } }
  }

  async destroy(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    try {
      await this.ticketRepository.destroy({ oid, ticketId })
      return { data: { ticketId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
