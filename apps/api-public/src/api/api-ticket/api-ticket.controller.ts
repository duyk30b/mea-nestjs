import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermissionOr } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketService } from './api-ticket.service'
import { TicketGetManyQuery, TicketGetOneQuery, TicketPaginationQuery } from './request'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketController {
  constructor(private readonly apiTicketService: ApiTicketService) { }

  @Get('pagination')
  @HasPermissionOr(PermissionId.TICKET_ORDER_READ, PermissionId.TICKET_CLINIC_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: TicketPaginationQuery) {
    return await this.apiTicketService.pagination(oid, query)
  }

  @Get('list')
  @HasPermissionOr(PermissionId.TICKET_ORDER_READ, PermissionId.TICKET_CLINIC_READ)
  async list(@External() { oid }: TExternal, @Query() query: TicketGetManyQuery) {
    return await this.apiTicketService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermissionOr(PermissionId.TICKET_ORDER_READ, PermissionId.TICKET_CLINIC_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketGetOneQuery
  ) {
    return await this.apiTicketService.getOne(oid, id, query)
  }
}
