import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketLaboratoryGroupService } from './api-ticket-laboratory-group.service'
import { TicketLaboratoryGroupGetOneQuery, TicketLaboratoryGroupPaginationQuery } from './request'

@ApiTags('TicketLaboratoryGroup')
@ApiBearerAuth('access-token')
@Controller('ticket-laboratory-group')
export class ApiTicketLaboratoryGroupController {
  constructor(private readonly apiTicketLaboratoryGroupService: ApiTicketLaboratoryGroupService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketLaboratoryGroupPaginationQuery
  ) {
    return await this.apiTicketLaboratoryGroupService.pagination(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketLaboratoryGroupGetOneQuery
  ) {
    return await this.apiTicketLaboratoryGroupService.getOne(oid, id, query)
  }
}
