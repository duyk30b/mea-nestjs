import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketGetManyQuery, TicketGetOneQuery, TicketPaginationQuery } from '../request'
import { TicketQueryService } from '../service/ticket-query.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketQueryController {
  constructor(private readonly ticketQueryService: TicketQueryService) { }

  @Get('pagination')
  @UserPermissionOr(PermissionId.TICKET_ORDER_MENU, PermissionId.TICKET_CLINIC_MENU)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketQueryService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: TicketGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketQueryService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketQueryService.getOne(oid, id, query)
    return { data }
  }
}
