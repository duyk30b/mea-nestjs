import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketSendProductAndPaymentBody } from '../ticket-action/request'
import {
  TicketOrderDebtSuccessInsertBody,
  TicketOrderDebtSuccessUpdateBody,
  TicketOrderDepositedUpdateBody,
  TicketOrderDraftInsertBody,
  TicketOrderDraftUpdateBody,
} from './request'
import { TicketOrderService } from './ticket-order.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketOrderController {
  constructor(private readonly ticketOrderService: TicketOrderService) { }

  @Post('/order/draft-insert')
  @UserPermission(PermissionId.TICKET_DRAFT_CRUD)
  async draftInsert(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketOrderDraftInsertBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.draftInsert({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('/order/:id/draft-update')
  @UserPermission(PermissionId.TICKET_DRAFT_CRUD)
  async draftUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: TicketOrderDraftUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.ticketOrderService.draftUpdate({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
    return { data }
  }

  @Post('/order/:id/deposited-update')
  @UserPermission(
    PermissionId.TICKET_DRAFT_CRUD,
    PermissionId.TICKET_CHANGE_PRODUCT,
    PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST
  )
  async depositedUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
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
    PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST,
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

  @Post('/order/:id/debt-success-update')
  @UserPermission(
    PermissionId.TICKET_DRAFT_CRUD,
    PermissionId.TICKET_CHANGE_PRODUCT,
    PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST,
    PermissionId.TICKET_CHANGE_PRODUCT_SEND_PRODUCT,
    PermissionId.TICKET_CHANGE_PRODUCT_RETURN_PRODUCT,
    PermissionId.TICKET_PAYMENT_MONEY,
    PermissionId.TICKET_REOPEN,
    PermissionId.TICKET_CLOSE
  )
  async debtSuccessUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
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
  @Post('/order/:id/destroy')
  @UserPermission(PermissionId.TICKET_DESTROY)
  async draftDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
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
    @Param() { id }: GenerateIdParam,
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
