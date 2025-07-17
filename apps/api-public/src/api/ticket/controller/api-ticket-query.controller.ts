import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
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
  async pagination(@External() { oid }: TExternal, @Query() query: TicketPaginationQuery) {
    return await this.ticketQueryService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: TicketGetManyQuery) {
    return await this.ticketQueryService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketGetOneQuery
  ) {
    return await this.ticketQueryService.getOne(oid, id, query)
  }
}
