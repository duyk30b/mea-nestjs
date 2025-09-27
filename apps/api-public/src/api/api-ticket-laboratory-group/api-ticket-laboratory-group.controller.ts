import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  ): Promise<BaseResponse> {
    const data = await this.apiTicketLaboratoryGroupService.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketLaboratoryGroupGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketLaboratoryGroupService.getOne(oid, id, query)
    return { data }
  }
}
