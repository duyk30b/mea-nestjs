import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketSendProductAndPaymentBody } from '../ticket-action/request'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDepositedUpdateBody,
  TicketOrderDraftUpsertBody,
} from './request'
import { TicketOrderService } from './ticket-order.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketOrderController {
  constructor(private readonly ticketOrderService: TicketOrderService) { }

  @Post('/order/draft-upsert')
  @UserPermission(PermissionId.TICKET_DRAFT_CRUD)
  async draftUpsert(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketOrderDraftUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.draftUpsert({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Patch('/order/:id/deposited-update')
  @UserPermission(
    PermissionId.TICKET_DRAFT_CRUD,
    PermissionId.TICKET_CHANGE_PRODUCT,
    PermissionId.TICKET_CHANGE_PROCEDURE
  )
  async depositedUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDepositedUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.depositedUpdate({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
    return { data }
  }

  @Post('/order/debt-success-create')
  @UserPermission(
    PermissionId.TICKET_DRAFT_CRUD,
    PermissionId.TICKET_CHANGE_PRODUCT,
    PermissionId.TICKET_CHANGE_PROCEDURE,
    PermissionId.TICKET_CHANGE_PRODUCT_SEND_PRODUCT,
    PermissionId.TICKET_PAYMENT_MONEY,
    PermissionId.TICKET_CLOSE
  )
  async debtSuccessCreate(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketOrderDebtSuccessInsertBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.debtSuccessCreate({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Patch('/order/:id/debt-success-update')
  @UserPermission(
    PermissionId.TICKET_DRAFT_CRUD,
    PermissionId.TICKET_CHANGE_PRODUCT,
    PermissionId.TICKET_CHANGE_PROCEDURE,
    PermissionId.TICKET_CHANGE_PRODUCT_SEND_PRODUCT,
    PermissionId.TICKET_CHANGE_PRODUCT_RETURN_PRODUCT,
    PermissionId.TICKET_PAYMENT_MONEY,
    PermissionId.TICKET_REOPEN,
    PermissionId.TICKET_CLOSE
  )
  async debtSuccessUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDebtSuccessUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.debtSuccessUpdate({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
    return { data }
  }

  // ================= ACTION ================= //
  @Delete('/order/:id/draft-destroy')
  @UserPermission(PermissionId.TICKET_DESTROY)
  async draftDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Delete('/order/:id/deposited-destroy')
  @UserPermission(PermissionId.TICKET_DESTROY)
  async depositedDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Delete('/order/:id/cancelled-destroy')
  @UserPermission(PermissionId.TICKET_DESTROY)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.ticketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Post('/order/:id/send-product-and-payment-and-close')
  @UserPermission(
    PermissionId.TICKET_CHANGE_PRODUCT_SEND_PRODUCT,
    PermissionId.TICKET_PAYMENT_MONEY,
    PermissionId.TICKET_CLOSE
  )
  async sendProductAndPaymentAndClose(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketSendProductAndPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.sendProductAndPaymentAndClose({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
    return { data }
  }
}
