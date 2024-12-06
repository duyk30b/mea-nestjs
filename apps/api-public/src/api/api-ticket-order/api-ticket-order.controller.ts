import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketOrderService } from './api-ticket-order.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDraftApprovedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderPaymentBody,
  TicketOrderReturnProductListBody,
} from './request'

@ApiTags('TicketOrder')
@ApiBearerAuth('access-token')
@Controller('ticket-order')
export class ApiTicketOrderController {
  constructor(private readonly apiTicketOrderService: ApiTicketOrderService) { }

  @Post('create-draft')
  @HasPermission(PermissionId.TICKET_ORDER_CREATE_DRAFT)
  async createDraft(@External() { oid, uid }: TExternal, @Body() body: TicketOrderDraftInsertBody) {
    return await this.apiTicketOrderService.createDraft({
      oid,
      userId: uid,
      body,
    })
  }

  @Patch(':id/update-draft-approved')
  @HasPermission(PermissionId.TICKET_ORDER_UPDATE_DRAFT_APPROVED)
  async updateDraftApproved(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDraftApprovedUpdateBody
  ) {
    return await this.apiTicketOrderService.updateDraftApproved({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
  }

  @Post('create-debt-success')
  @HasPermission(PermissionId.TICKET_ORDER_CREATE_DEBT_SUCCESS)
  async createDebtSuccess(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketOrderDebtSuccessInsertBody
  ) {
    return await this.apiTicketOrderService.createDebtSuccess({
      oid,
      userId: uid,
      body,
    })
  }

  @Patch(':id/update-debt-success')
  @HasPermission(PermissionId.TICKET_ORDER_UPDATE_DEBT_SUCCESS)
  async updateDebtSuccess(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDebtSuccessUpdateBody
  ) {
    return await this.apiTicketOrderService.updateDebtSuccess({
      oid,
      userId: uid,
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
    return await this.apiTicketOrderService.prepayment({ oid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @HasPermission(PermissionId.TICKET_ORDER_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderService.refundOverpaid({ oid, ticketId: id, body })
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
    return await this.apiTicketOrderService.sendProductAndPaymentAndClose({
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
    return await this.apiTicketOrderService.paymentAndClose({
      oid,
      ticketId: id,
      money: body.money,
    })
  }

  @Post(':id/send-product')
  @HasPermission(PermissionId.TICKET_ORDER_SEND_PRODUCT)
  async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.sendProduct({
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
    return await this.apiTicketOrderService.returnProduct({ oid, ticketId: id, body })
  }

  @Post(':id/pay-debt')
  @HasPermission(PermissionId.TICKET_ORDER_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderPaymentBody
  ) {
    return await this.apiTicketOrderService.payDebt({ oid, ticketId: id, body })
  }

  @Post(':id/cancel')
  @HasPermission(PermissionId.TICKET_ORDER_CANCEL)
  async cancel(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.cancel({ oid, ticketId: id })
  }

  @Delete(':id/destroy')
  @HasPermission(PermissionId.TICKET_ORDER_DESTROY_DRAFT)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
  }
}
