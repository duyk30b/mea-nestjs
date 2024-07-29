import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketOrderDebtSuccessUpdate } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-debt-success-update'
import { TicketOrderDraftApprovedUpdate } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order-draft-approved-update'
import { TicketOrderDraft } from '../../../../_libs/database/repository/ticket/ticket-order/ticket-order.draft'
import { CacheDataService } from '../../../../_libs/transporter/cache-manager/cache-data.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
} from './request-basic/ticket-order-upsert.body'

@Injectable()
export class ApiTicketOrderBasicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketOrderDraft: TicketOrderDraft,
    private readonly ticketOrderDraftApprovedUpdate: TicketOrderDraftApprovedUpdate,
    private readonly ticketOrderDebtSuccessUpdate: TicketOrderDebtSuccessUpdate,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly cacheDataService: CacheDataService
  ) { }

  async createDraft(params: {
    oid: number
    body: TicketOrderDraftInsertBody
  }): Promise<BaseResponse> {
    const { oid, body } = params
    try {
      const { ticketBasic } = await this.ticketOrderDraft.create({
        oid,
        ticketOrderDraftInsert: body.ticketOrderDraftInsert,
        ticketOrderProductDraftList: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
      })
      return { data: { ticketBasic } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateDraftApproved(params: {
    oid: number
    ticketId: number
    body: TicketOrderDraftApprovedUpdateBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const { ticketBasic } = await this.ticketOrderDraftApprovedUpdate.update({
        oid,
        ticketId,
        ticketOrderDraftApprovedUpdate: body.ticketOrderDraftApprovedUpdate,
        ticketOrderProductDraftList: body.ticketOrderProductDraftList,
        ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
        ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
        ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
      })
      return { data: { ticketBasic } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroyDraft(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    try {
      await this.ticketOrderDraft.destroy({ oid, ticketId })
      return { data: { ticketId } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createDebtSuccess(params: {
    oid: number
    body: TicketOrderDebtSuccessInsertBody
  }): Promise<BaseResponse> {
    const { oid, body } = params
    const { paid, ...ticketOrderDraftInsert } = body.ticketOrderDebtSuccessInsert
    const time = ticketOrderDraftInsert.registeredAt

    const createDraftResponse = await this.ticketOrderDraft.create({
      oid,
      ticketOrderDraftInsert,
      ticketOrderProductDraftList: body.ticketOrderProductDraftList,
      ticketOrderProcedureDraftList: body.ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList: body.ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList: body.ticketOrderExpenseDraftList,
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
    ticketId: number
    body: TicketOrderDebtSuccessUpdateBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { ticketBasic, batchList, productList } =
        await this.ticketOrderDebtSuccessUpdate.update({
          oid,
          ticketId,
          ticketOrderDebtSuccessUpdate: body.ticketOrderDebtSuccessUpdate,
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
}
