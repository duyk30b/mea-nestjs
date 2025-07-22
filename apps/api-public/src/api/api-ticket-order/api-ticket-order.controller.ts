import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import {
  TicketSendProductAndPaymentBody,
} from '../ticket/request'
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
  @UserPermission(PermissionId.TICKET_ORDER_DRAFT_CRUD)
  async draftUpsert(@External() { oid, uid }: TExternal, @Body() body: TicketOrderDraftUpsertBody) {
    return await this.apiTicketOrderService.draftUpsert({
      oid,
      userId: uid,
      body,
    })
  }

  @Patch('/:id/deposited-update')
  @UserPermission(PermissionId.TICKET_ORDER_DRAFT_CRUD)
  async depositedUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDepositedUpdateBody
  ) {
    return await this.apiTicketOrderService.depositedUpdate({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
  }

  @Post('debt-success-create')
  @UserPermission(PermissionId.TICKET_ORDER_DEBT_SUCCESS_CRUD)
  async debtSuccessCreate(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketOrderDebtSuccessInsertBody
  ) {
    return await this.apiTicketOrderService.debtSuccessCreate({
      oid,
      userId: uid,
      body,
    })
  }

  @Patch('/:id/debt-success-update')
  @UserPermission(PermissionId.TICKET_ORDER_DEBT_SUCCESS_CRUD)
  async debtSuccessUpdate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketOrderDebtSuccessUpdateBody
  ) {
    return await this.apiTicketOrderService.debtSuccessUpdate({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
  }

  // ================= ACTION ================= //
  @Delete('/:id/draft-destroy')
  @UserPermission(PermissionId.TICKET_ORDER_DRAFT_CRUD)
  async draftDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Delete('/:id/deposited-destroy')
  @UserPermission(PermissionId.TICKET_ORDER_DEPOSITED_DESTROY)
  async depositedDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Delete('/:id/cancelled-destroy')
  @UserPermission(PermissionId.TICKET_ORDER_CANCELLED_DESTROY)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.apiTicketOrderService.destroy({
      oid,
      ticketId: id,
    })
    return { data }
  }

  @Post('/:id/send-product-and-payment-and-close')
  @UserPermission(PermissionId.PRODUCT_SEND_PRODUCT, PermissionId.TICKET_ORDER_CLOSE)
  async sendProductAndPaymentAndClose(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketSendProductAndPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.apiTicketOrderService.sendProductAndPaymentAndClose({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
    return { data }
  }
}
