import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { TicketPaymentMoneyBody, TicketReturnProductListBody } from '../api-ticket/request'
import { ApiTicketOrderService } from './api-ticket-order.service'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDepositedUpdateBody,
  TicketOrderDraftUpsertBody,
} from './request'

@ApiTags('TicketOrder')
@ApiBearerAuth('access-token')
@Controller('ticket-order')
export class ApiTicketOrderController {
  constructor(private readonly apiTicketOrderService: ApiTicketOrderService) { }

  @Post('draft-upsert')
  @HasPermission(PermissionId.TICKET_ORDER_DRAFT_UPSERT)
  async draftUpsert(@External() { oid, uid }: TExternal, @Body() body: TicketOrderDraftUpsertBody) {
    return await this.apiTicketOrderService.draftUpsert({
      oid,
      userId: uid,
      body,
    })
  }

  @Delete(':id/draft-destroy')
  @HasPermission(PermissionId.TICKET_ORDER_DRAFT_UPSERT)
  async draftDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
  }

  @Patch(':id/update-deposited')
  @HasPermission(PermissionId.TICKET_ORDER_DRAFT_UPSERT)
  async updateDeposited(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDepositedUpdateBody
  ) {
    return await this.apiTicketOrderService.updateDeposited({
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

  @Post(':id/prepayment')
  @HasPermission(PermissionId.TICKET_ORDER_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketOrderService.prepayment({ oid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @HasPermission(PermissionId.TICKET_ORDER_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
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
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketOrderService.sendProductAndPaymentAndClose({
      oid,
      ticketId: id,
      body,
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
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketOrderService.paymentAndClose({
      oid,
      ticketId: id,
      body,
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
    @Body() body: TicketReturnProductListBody
  ) {
    return await this.apiTicketOrderService.returnProduct({ oid, ticketId: id, body })
  }

  @Post(':id/pay-debt')
  @HasPermission(PermissionId.TICKET_ORDER_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketOrderService.payDebt({ oid, ticketId: id, body })
  }

  @Post(':id/cancel')
  @HasPermission(PermissionId.TICKET_ORDER_CANCEL)
  async cancel(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.cancel({ oid, ticketId: id })
  }

  @Delete(':id/cancel-destroy')
  @HasPermission(PermissionId.TICKET_ORDER_CANCEL_DESTROY)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
  }
}
