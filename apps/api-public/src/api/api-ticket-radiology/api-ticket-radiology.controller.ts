import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import { TicketRadiologyGetOneQuery, TicketRadiologyPaginationQuery } from './request'

@ApiTags('TicketRadiology')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRadiologyController {
  constructor(private readonly apiTicketRadiologyService: ApiTicketRadiologyService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketRadiologyPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketRadiologyService.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketRadiologyGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketRadiologyService.getOne({ oid, id, query })
    return { data }
  }
}
