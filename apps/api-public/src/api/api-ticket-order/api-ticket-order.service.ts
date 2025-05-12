import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { TicketProduct } from '../../../../_libs/database/entities'
import { VoucherType } from '../../../../_libs/database/entities/payment.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketOrderDepositedOperation,
  TicketOrderDraftOperation,
  TicketPayDebtOperation,
  TicketPaymentAndCloseOperation,
  TicketPrepaymentOperation,
  TicketRefundOverpaidOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../_libs/database/operations'
import {
  PaymentRepository,
  TicketBatchRepository,
  TicketProductRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketPaymentMoneyBody, TicketReturnProductListBody } from '../api-ticket/request'
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
    private readonly cacheDataService: CacheDataService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketOrderDraftOperation: TicketOrderDraftOperation,
    private readonly ticketOrderDepositedOperation: TicketOrderDepositedOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketRefundOverpaidOperation: TicketRefundOverpaidOperation,
    private readonly ticketReopenOperation: TicketReopenOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation,
    private readonly paymentRepository: PaymentRepository
  ) { }

  async draftUpsert(params: {
    oid: number
    userId: number
    body: TicketOrderDraftUpsertBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    try {
      const { ticket } = await this.ticketOrderDraftOperation.upsert({
        oid,
        ticketId: body.ticketId,
        ticketOrderDraftUpsertDto: {
          ...body.ticketOrderDraftUpsert,
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
        // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async depositedUpdate(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDepositedUpdateBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket } = await this.ticketOrderDepositedOperation.update({
        oid,
        ticketId,
        ticketOrderDepositedUpdateDto: {
          ...body.ticketOrderDepositedUpdate,
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
        // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
      })
      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async debtSuccessCreate(params: {
    oid: number
    userId: number
    body: TicketOrderDebtSuccessInsertBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    const { paid, ...ticketOrderDraftInsertBody } = body.ticketOrderDebtSuccessInsert
    const time = ticketOrderDraftInsertBody.registeredAt

    const createDraftResponse = await this.ticketOrderDraftOperation.upsert({
      oid,
      ticketId: 0,
      ticketOrderDraftUpsertDto: {
        ...ticketOrderDraftInsertBody,
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
      // ticketAttributeDraftListDto: body.ticketOrderAttributeDaftList,
    })

    const ticketId = createDraftResponse.ticket.id

    if (body.ticketOrderProductDraftList.length) {
      await this.sendAllProduct({ oid, ticketId })
    }

    const { ticket, customer } = await this.ticketPaymentAndCloseOperation.paymentAndClose({
      oid,
      ticketId,
      cashierId: userId,
      money: paid,
      time,
      paymentMethodId: 0,
      note: '',
    })

    if (customer) {
      this.socketEmitService.customerUpsert(oid, { customer })
    }
    return { data: { ticket } }
  }

  async debtSuccessUpdate(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketOrderDebtSuccessUpdateBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = params
    const time = Date.now()
    const promiseData = await Promise.all([
      this.ticketRepository.findOneBy({ oid, id: ticketId }),
      this.ticketProductRepository.findManyBy({ oid, ticketId }),
    ])
    let ticket = promiseData[0]
    const ticketProductList = promiseData[1]

    if ([TicketStatus.Draft, TicketStatus.Schedule].includes(ticket.status)) {
      return { data: { ticketId } }
    }
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticket.status)) {
      const responseReopen = await this.ticketReopenOperation.reopen({
        oid,
        ticketId,
        cashierId: userId,
        time,
        description: 'Sửa đơn',
        paymentMethodId: 0,
        note: '',
        newPaid: 0,
      })
      ticket = responseReopen.ticket
    }
    const responseReturnAllProduct = await this.returnAllProduct({ oid, ticketId })

    ticket = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        status: TicketStatus.Deposited,
      }
    )
    const { paid: paidBody, ...ticketBodyUpdate } = body.ticketOrderDebtSuccessUpdate
    // không update paid, giữ nguyên số tiền trước update, trả paid thêm vào ở dưới cùng
    const responseUpdate = await this.ticketOrderDepositedOperation.update({
      oid,
      ticketId,
      ticketOrderDepositedUpdateDto: {
        ...ticketBodyUpdate,
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
    })
    ticket = responseUpdate.ticket

    const responseSendAllProduct = await this.sendAllProduct({ ticketId, oid })
    if (responseSendAllProduct.ticket) {
      ticket = responseSendAllProduct.ticket
    }

    await this.ticketPaymentAndCloseOperation.paymentAndClose({
      oid,
      ticketId,
      cashierId: userId,
      time,
      money: paidBody - ticket.paid, // trả thêm tiền ở đây
      paymentMethodId: 0,
      note: 'Sửa đơn',
    })

    return { data: { ticketId } }
  }

  // ================= ACTION ================= //

  async destroy(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    await this.ticketRepository.destroy({ oid, ticketId })
    return { data: { ticketId } }
  }

  async sendProductAndPaymentAndClose(params: {
    oid: number
    ticketId: number
    userId: number
    body: TicketPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body, userId } = params
    const time = Date.now()
    await this.sendAllProduct({ oid, ticketId })
    const { ticket, payment } = await this.ticketPaymentAndCloseOperation.paymentAndClose({
      oid,
      cashierId: userId,
      ticketId,
      time,
      money: body.money,
      paymentMethodId: body.paymentMethodId,
      note: body.note,
    })
    const ticketProductList = await this.ticketProductRepository.findMany({
      relation: { product: true },
      condition: {
        oid,
        ticketId,
      },
      sort: { id: 'ASC' },
    })
    return { data: { ticket, ticketProductList, payment } }
  }

  async prepayment(options: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body, userId } = options
    try {
      const { ticket, payment } = await this.ticketPrepaymentOperation.prepayment({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
        cashierId: userId,
      })

      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()

    const { ticket } = await this.sendAllProduct({ oid, ticketId })

    const ticketProductList = await this.ticketProductRepository.findMany({
      relation: { product: true },
      condition: { oid, ticketId },
      sort: { id: 'ASC' },
    })

    return { data: { ticket, ticketProductList } }
  }

  async close(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, ticketId, userId } = params
    const time = Date.now()
    try {
      const { ticket, customer, payment } =
        await this.ticketPaymentAndCloseOperation.paymentAndClose({
          oid,
          cashierId: userId,
          ticketId,
          time,
          money: 0,
          paymentMethodId: 0,
          note: '',
        })
      return { data: { ticket, payment } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(options: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body, userId } = options

    const { ticket, payment } = await this.ticketRefundOverpaidOperation.refundOverpaid({
      oid,
      ticketId,
      cashierId: userId,
      time: Date.now(),
      money: body.money,
      paymentMethodId: body.paymentMethodId,
      note: body.note,
      description: '',
    })
    return { data: { ticket, payment } }
  }

  async returnProduct(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = params
    try {
      const time = Date.now()

      let ticket = await this.ticketRepository.findOneBy({ oid, id: ticketId })
      if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticket.status)) {
        const result = await this.ticketReopenOperation.reopen({
          oid,
          cashierId: userId,
          ticketId,
          time,
          description: 'Hoàn trả',
          note: '',
          paymentMethodId: 0,
          newPaid: ticket.paid,
        })
        ticket = result.ticket
      }

      const result = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time: Date.now(),
        returnList: body.returnList,
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
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId, body } = options
    try {
      const { ticket, payment, customer } = await this.ticketPayDebtOperation.payDebt({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async terminate(options: {
    oid: number
    userId: number
    ticketId: number
  }): Promise<BaseResponse> {
    const { oid, userId, ticketId } = options
    const time = Date.now()
    const promiseData = await Promise.all([
      this.ticketRepository.findOneBy({ oid, id: ticketId }),
      this.ticketProductRepository.findManyBy({ oid, ticketId }),
    ])
    const ticketOrigin = promiseData[0]

    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketOrigin.status)) {
      await this.ticketReopenOperation.reopen({
        oid,
        cashierId: userId,
        ticketId,
        time,
        paymentMethodId: 0,
        description: 'Hủy phiếu',
        note: '',
        newPaid: 0,
      })
    }

    if ([TicketStatus.Deposited, TicketStatus.Executing].includes(ticketOrigin.status)) {
      if (ticketOrigin.paid > 0) {
        await this.ticketRefundOverpaidOperation.refundOverpaid({
          oid,
          cashierId: userId,
          time,
          ticketId,
          paymentMethodId: 0,
          money: ticketOrigin.paid,
          description: 'Hủy phiếu',
          note: '',
        })
      }
    }

    let ticketProductList: TicketProduct[] = []
    if (ticketOrigin.deliveryStatus === DeliveryStatus.Delivered) {
      const returnProductResponse = await this.returnAllProduct({ oid, ticketId })
      ticketProductList = returnProductResponse.ticketProductModifiedList
    }

    const ticket = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      { status: TicketStatus.Cancelled }
    )
    const paymentList = await this.paymentRepository.findMany({
      condition: {
        oid,
        voucherId: ticketId,
        voucherType: VoucherType.Ticket,
      },
      sort: { id: 'ASC' },
    })
    return { data: { ticket, paymentList, ticketProductList } }
  }

  async sendAllProduct(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    const time = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResponse = await this.ticketSendProductOperation.sendAllProduct({
      oid,
      ticketId,
      time,
      allowNegativeQuantity,
    })

    return {
      ticket: sendProductResponse.ticket,
      productList: sendProductResponse.productModifiedList,
      ticketProductList: sendProductResponse.ticketProductModifiedList,
    }
  }

  async returnAllProduct(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    const time = Date.now()
    const ticketBatchList = await this.ticketBatchRepository.findManyBy({
      oid,
      ticketId,
      deliveryStatus: DeliveryStatus.Delivered,
    })
    const returnList = ticketBatchList.map((i) => ({
      ticketProductId: i.ticketProductId,
      ticketBatchId: i.id,
      quantityReturn: i.quantity,
    }))

    if (returnList.length) {
      const { ticket, ticketProductModifiedList } =
        await this.ticketReturnProductOperation.returnProduct({
          oid,
          ticketId,
          time,
          returnList,
          options: { changePendingIfNoStock: true },
        })
      return { ticket, ticketProductModifiedList }
    } else {
      return {}
    }
  }
}
