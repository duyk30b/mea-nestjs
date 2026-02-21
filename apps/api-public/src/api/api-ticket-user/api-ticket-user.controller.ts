import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketUserService } from './api-ticket-user.service'
import { TicketUserGetManyQuery, TicketUserPaginationQuery } from './request'

@ApiTags('TicketUser')
@ApiBearerAuth('access-token')
@Controller('ticket-user')
export class ApiTicketUserController {
  constructor(private readonly apiTicketUserService: ApiTicketUserService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketUserPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketUserService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: TicketUserGetManyQuery) {
    const data = await this.apiTicketUserService.getList(oid, query)
    return { data }
  }

  @Get('sum-commission-money')
  @UserPermission()
  async sumCommissionMoney(@External() { oid }: TExternal, @Query() query: TicketUserGetManyQuery) {
    const data = await this.apiTicketUserService.sumCommissionMoney(oid, query)
    return { data }
  }
}
