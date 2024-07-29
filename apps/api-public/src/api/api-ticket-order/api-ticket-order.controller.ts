import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketOrderActionService } from './api-ticket-order-action.service'
import { ApiTicketOrderBasicService } from './api-ticket-order-basic.service'
import { TicketOrderPaymentBody } from './request-action/ticket-order-payment.body'
import { TicketOrderReturnProductListBody } from './request-action/ticket-order-return-product-list.body'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
} from './request-basic/ticket-order-upsert.body'

@ApiTags('TicketOrder')
@ApiBearerAuth('access-token')
@Controller('ticket-order')
export class ApiTicketOrderController {
  constructor(
    private readonly apiTicketOrderBasicService: ApiTicketOrderBasicService,
    private readonly apiTicketOrderActionService: ApiTicketOrderActionService
  ) { }

  @Post('create-draft')
  @HasPermission(PermissionId.TICKET_ORDER_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: TicketOrderDraftInsertBody) {
    return await this.apiTicketOrderBasicService.createDraft({ oid, body })
  }

  @Patch(':id/update-draft-approved')
  @HasPermission(PermissionId.TICKET_ORDER_UPDATE_DRAFT_APPROVED)
  async updateDraftApproved(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDraftApprovedUpdateBody
  ) {
    return await this.apiTicketOrderBasicService.updateDraftApproved({
      oid,
      ticketId: id,
      body,
    })
  }

  @Delete(':id/destroy-draft')
  @HasPermission(PermissionId.TICKET_ORDER_DESTROY_DRAFT)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderBasicService.destroyDraft({
      oid,
      ticketId: id,
    })
  }

  @Post('create-debt-success')
  @HasPermission(PermissionId.TICKET_ORDER_CREATE_DEBT_SUCCESS)
  async createDebtSuccess(
    @External() { oid }: TExternal,
    @Body() body: TicketOrderDebtSuccessInsertBody
  ) {
    return await this.apiTicketOrderBasicService.createDebtSuccess({ oid, body })
  }

  @Patch(':id/update-debt-success')
  @HasPermission(PermissionId.TICKET_ORDER_UPDATE_DEBT_SUCCESS)
  async updateDebtSuccess(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDebtSuccessUpdateBody
  ) {
    return await this.apiTicketOrderBasicService.updateDebtSuccess({
      oid,
      ticketId: id,
      body,
    })
  }

  // Khu vực cho API chung chung
  @Post(':id/prepayment')
  @HasPermission(PermissionId.TICKET_ORDER_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderActionService.prepayment({ oid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @HasPermission(PermissionId.TICKET_ORDER_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderActionService.refundOverpaid({ oid, ticketId: id, body })
  }

  @Post(':id/send-product-and-payment-and-close')
  @HasPermission(
    PermissionId.TICKET_ORDER_SEND_PRODUCT,
    PermissionId.TICKET_ORDER_PAYMENT_AND_CLOSE
  )
  async sendProductAndPaymentAndClose(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderActionService.sendProductAndPaymentAndClose({
      oid,
      ticketId: id,
      money: body.money,
    })
  }

  @Post(':id/payment-and-close')
  @HasPermission(
    PermissionId.TICKET_ORDER_SEND_PRODUCT,
    PermissionId.TICKET_ORDER_PAYMENT_AND_CLOSE
  )
  async paymentAndClose(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderActionService.paymentAndClose({
      oid,
      ticketId: id,
      money: body.money,
    })
  }

  @Post(':id/send-product')
  @HasPermission(PermissionId.TICKET_ORDER_SEND_PRODUCT)
  async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderActionService.sendProduct({
      oid,
      ticketId: id,
    })
  }

  @Post(':id/return-product')
  @HasPermission(PermissionId.TICKET_ORDER_RETURN_PRODUCT, PermissionId.TICKET_ORDER_REOPEN)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderReturnProductListBody
  ) {
    return await this.apiTicketOrderActionService.returnProduct({ oid, ticketId: id, body })
  }

  @Post(':id/pay-debt')
  @HasPermission(PermissionId.TICKET_ORDER_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderActionService.payDebt({ oid, ticketId: id, body })
  }

  @Post(':id/cancel')
  @HasPermission(PermissionId.TICKET_ORDER_CANCEL)
  async cancel(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderActionService.cancel({ oid, ticketId: id })
  }
}
