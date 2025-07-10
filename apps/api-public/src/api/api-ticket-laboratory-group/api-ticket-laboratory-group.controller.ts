import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiTicketLaboratoryGroupAction } from './api-ticket-laboratory-group.action'
import { ApiTicketLaboratoryGroupService } from './api-ticket-laboratory-group.service'
import {
  TicketLaboratoryGroupGetOneQuery,
  TicketLaboratoryGroupPaginationQuery,
  TicketLaboratoryGroupPostQuery,
  TicketLaboratoryGroupUpdateResultBody,
} from './request'

@ApiTags('TicketLaboratoryGroup')
@ApiBearerAuth('access-token')
@Controller('ticket-laboratory-group')
export class ApiTicketLaboratoryGroupController {
  constructor(
    private readonly apiTicketLaboratoryGroupService: ApiTicketLaboratoryGroupService,
    private readonly apiTicketLaboratoryGroupAction: ApiTicketLaboratoryGroupAction
  ) { }

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

  @Post('update-result/:id')
  @UserPermission(PermissionId.LABORATORY_UPDATE_RESULT)
  async updateResultTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketLaboratoryGroupUpdateResultBody,
    @Query() query: TicketLaboratoryGroupPostQuery
  ) {
    return await this.apiTicketLaboratoryGroupAction.updateResult({
      oid,
      ticketLaboratoryGroupId: id,
      body,
      query,
    })
  }

  @Post('cancel-result/:id')
  @UserPermission(PermissionId.LABORATORY_CANCEL_RESULT)
  async cancelResultTicketLaboratory(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketLaboratoryGroupAction.cancelResult({
      oid,
      ticketLaboratoryGroupId: id,
    })
  }
}
