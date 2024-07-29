import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import { TicketRadiologyGetOneQuery, TicketRadiologyPaginationQuery } from './request'

@ApiTags('TicketRadiology')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRadiologyController {
  constructor(private readonly apiTicketRadiologyService: ApiTicketRadiologyService) { }

  @Get('pagination')
  @HasPermission(PermissionId.TICKET_CLINIC_READ_TICKET_RADIOLOGY)
  async pagination(@External() { oid }: TExternal, @Query() query: TicketRadiologyPaginationQuery) {
    return await this.apiTicketRadiologyService.pagination(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.TICKET_CLINIC_READ_TICKET_RADIOLOGY)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketRadiologyGetOneQuery
  ) {
    return await this.apiTicketRadiologyService.getOne(oid, id, query)
  }
}
