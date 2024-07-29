import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { TicketPayDebt } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { TicketOrderCancel } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-cancel'
import { TicketOrderDebtSuccessUpdate } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-debt-success-update'
import { TicketOrderDraftApprovedUpdate } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-draft-approved-update'
import { TicketOrderRefundOverpaid } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-refund-overpaid'
import { TicketOrderReturnProductList } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-return-product-list'
import { TicketOrderDraft } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order.draft'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderPaymentBody,
  TicketOrderReturnProductListBody,
} from './request'

@Injectable()
export class ApiTicketOrderService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketOrderDraft: TicketOrderDraft,
    private readonly ticketOrderDraftApprovedUpdate: TicketOrderDraftApprovedUpdate,
    private readonly ticketOrderDebtSuccessUpdate: TicketOrderDebtSuccessUpdate,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPrepayment: TicketPrepayment,
    private readonly ticketPayDebt: TicketPayDebt,
    private readonly ticketOrderRefundOverpaid: TicketOrderRefundOverpaid,
    private readonly ticketOrderCancel: TicketOrderCancel,
    private readonly ticketOrderReturnProductList: TicketOrderReturnProductList
  ) { }

  async createDraft(params: {
    oid: number
    userId: number
    body: TicketOrderDraftInsertBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    try {
      const { ticketBasic } = await this.ticketOrderDraft.create({
        oid,
        ticketOrderDraftInsert: {
          ...body.ticketOrderDraftInsert,
          customerSourceId: 0,
          laboratoryMoney: 0,
          radiologyMoney: 0,
          dailyIndex: 0,
          imageIds: JSON.stringify([]),
        },
        ticketOrderProductDraftList: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
        ticketAttributeDraftList: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticketBasic } }
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
      const { ticketBasic } = await this.ticketOrderDraftApprovedUpdate.update({
        oid,
        ticketId,
        ticketOrderDraftApprovedUpdate: {
          ...body.ticketOrderDraftApprovedUpdate,
          customerSourceId: 0,
          laboratoryMoney: 0,
          radiologyMoney: 0,
          dailyIndex: 0,
          imageIds: JSON.stringify([]),
        },
        ticketOrderProductDraftList: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
        ticketAttributeDraftList: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticketBasic } }
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

    const createDraftResponse = await this.ticketOrderDraft.create({
      oid,
      ticketOrderDraftInsert: {
        ...ticketOrderDraftInsert,
        customerSourceId: 0,
        laboratoryMoney: 0,
        radiologyMoney: 0,
        dailyIndex: 0,
        imageIds: JSON.stringify([]),
      },
      ticketOrderProductDraftList: body.ticketOrderProductDraftList,
      ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
      ticketAttributeDraftList: body.ticketOrderAttributeDaftList,
    })

    const ticketId = createDraftResponse.ticketBasic.id

    if (body.ticketOrderProductDraftList.length) {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const sendProductResponse = await this.ticketSendProduct.sendProduct({
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

    const { ticketBasic, customer } = await this.ticketPaymentAndClose.paymentAndClose({
      oid,
      ticketId,
      money: paid,
      time,
    })

    if (customer) {
      this.socketEmitService.customerUpsert(oid, { customer })
    }
    return { data: { ticketBasic } }
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
      const { ticketBasic, batchList, productList } =
        await this.ticketOrderDebtSuccessUpdate.update({
          oid,
          ticketId,
          ticketOrderDebtSuccessUpdate: {
            ...body.ticketOrderDebtSuccessUpdate,
            customerSourceId: 0,
            laboratoryMoney: 0,
            radiologyMoney: 0,
            dailyIndex: 0,
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
      return { data: { ticketBasic } }
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
      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true, batch: true },
        condition: {
          oid,
          ticketId,
        },
        sort: { id: 'ASC' },
      })
      return { data: { ticketBasic, ticketProductList, customerPayment } }
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
      return { data: { ticketBasic, ticketProductList } }
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
          description: 'Trả hàng',
          ...body,
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

    const { ticketBasic, customerPayment } = await this.ticketOrderCancel.cancel({
      oid,
      ticketId,
      time: Date.now(),
      description: 'Hủy phiếu',
    })
    return { data: { ticketBasic, customerPayment } }
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
