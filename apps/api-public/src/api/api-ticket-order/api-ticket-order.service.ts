import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketOrderCancelOperation,
  TicketOrderDebtSuccessUpdateOperation,
  TicketOrderDraftApprovedOperation,
  TicketOrderDraftOperation,
  TicketOrderReturnOperation,
  TicketPayDebtOperation,
  TicketPaymentAndCloseOperation,
  TicketPrepaymentOperation,
  TicketRefundMoneyOperation,
  TicketSendProductOperation,
} from '../../../../_libs/database/operations'
import { TicketProductRepository, TicketRepository } from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderPaymentBody,
  TicketOrderReturnBody,
} from './request'

@Injectable()
export class ApiTicketOrderService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketOrderDraftOperation: TicketOrderDraftOperation,
    private readonly ticketOrderDraftApprovedOperation: TicketOrderDraftApprovedOperation,
    private readonly ticketOrderDebtSuccessUpdateOperation: TicketOrderDebtSuccessUpdateOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundMoneyOperation,
    private readonly ticketOrderCancelOperation: TicketOrderCancelOperation,
    private readonly ticketOrderReturnOperation: TicketOrderReturnOperation
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
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const sendProductResponse = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      this.socketEmitService.batchListUpdate(oid, {
        batchList: sendProductResponse.batchList,
      })
      this.socketEmitService.productListUpdate(oid, {
        productList: sendProductResponse.productList,
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

  async updateDebtSuccess(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDebtSuccessUpdateBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = params
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { ticket, batchList, productList } =
        await this.ticketOrderDebtSuccessUpdateOperation.update({
          oid,
          ticketId,
          ticketOrderDebtSuccessUpdate: {
            ...body.ticketOrderDebtSuccessUpdate,
            customType: 0,
            customerSourceId: 0,
            laboratoryMoney: 0,
            radiologyMoney: 0,
            dailyIndex: 0,
            commissionMoney: 0,
            imageIds: JSON.stringify([]),
          },
          ticketOrderProductDraftList: body.ticketOrderProductDraftList,
          ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
          ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
          ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
          description: 'Sửa đơn',
          allowNegativeQuantity,
        })
      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
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
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { productList, batchList } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      const { ticket, customer, customerPayment } =
        await this.ticketPaymentAndCloseOperation.paymentAndClose({
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
      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true, batch: true },
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
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { ticket, productList, batchList } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })

      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true, batch: true },
        condition: {
          oid,
          ticketId,
        },
        sort: { id: 'ASC' },
      })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      return { data: { ticket, ticketProductList } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketOrderReturnBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const { ticket, productList, batchList, customer, customerPayment } =
        await this.ticketOrderReturnOperation.return({
          oid,
          ticketId,
          time: Date.now(),
          description: 'Trả hàng',
          ...body,
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }

      return { data: { ticket, customerPayment } }
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

    const { ticket, customerPayment } = await this.ticketOrderCancelOperation.cancel({
      oid,
      ticketId,
      time: Date.now(),
      description: 'Hủy phiếu',
    })
    return { data: { ticket, customerPayment } }
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
