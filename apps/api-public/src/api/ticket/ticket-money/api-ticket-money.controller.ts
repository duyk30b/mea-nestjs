import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TicketParams } from '../ticket-query/request'
import {
    TicketPayDebtBody,
    TicketPaymentMoneyBody,
} from './request'
import { TicketMoneyService } from './ticket-money.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketMoneyController {
  constructor(
    private readonly ticketMoneyService: TicketMoneyService
  ) { }

  @Post(':ticketId/payment-money')
  @UserPermission(PermissionId.TICKET_PAYMENT_MONEY)
  async prepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketPaymentMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.paymentMoney({
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
    @Body() body: TicketPayDebtBody
  ): Promise<BaseResponse> {
    const data = await this.ticketMoneyService.payDebt({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }
}
