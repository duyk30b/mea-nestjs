import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaymentTicketService } from './payment_ticket.service'
import { PaymentTicketGetManyQuery, PaymentTicketPaginationQuery } from './request'

@ApiTags('PaymentTicket')
@ApiBearerAuth('access-token')
@Controller('payment-ticket')
export class PaymentTicketController {
  constructor(private readonly paymentTicketService: PaymentTicketService) {}

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PaymentTicketPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentTicketService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(
    @External() { oid }: TExternal,
    @Query() query: PaymentTicketGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentTicketService.getMany(oid, query)
    return { data }
  }
}
