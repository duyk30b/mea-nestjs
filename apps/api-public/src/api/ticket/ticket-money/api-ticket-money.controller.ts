import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import {
  CustomerPayDebtBody,
  CustomerPrepaymentBody,
  CustomerPrepaymentTicketItemListBody,
  CustomerRefundMoneyBody,
  CustomerRefundTicketItemListBody,
} from './request'
import { TicketMoneyService } from './ticket-money.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketMoneyController {
  constructor(private readonly ticketMoneyService: TicketMoneyService) { }

  @Post(':ticketId/prepayment-money')
  @UserPermission(PermissionId.TICKET_PAYMENT_MONEY)
  async prepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: CustomerPrepaymentBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.prepaymentMoney({
      oid,
      ticketId,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('pay-debt')
  @UserPermission(PermissionId.TICKET_PAYMENT_MONEY)
  async payDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPayDebtBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.payDebt({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post(':ticketId/refund-money')
  @UserPermission(PermissionId.TICKET_REFUND_MONEY)
  async refundMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: CustomerRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.refundMoney({ oid, ticketId, userId: uid, body })
    return { data }
  }

  @Post(':ticketId/prepayment-ticket-item-list')
  @UserPermission(PermissionId.TICKET_PAYMENT_MONEY)
  async customerPrepaymentTicketItemList(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: CustomerPrepaymentTicketItemListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.prepaymentTicketItemList({
      oid,
      ticketId,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post(':ticketId/refund-ticket-item-list')
  @UserPermission(PermissionId.TICKET_REFUND_MONEY)
  async refundTicketItemList(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: CustomerRefundTicketItemListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.refundTicketItemList({
      oid,
      ticketId,
      userId: uid,
      body,
    })
    return { data }
  }
}
