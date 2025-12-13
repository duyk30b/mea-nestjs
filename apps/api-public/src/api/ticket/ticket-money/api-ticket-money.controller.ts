import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
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
