import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'
import { TicketRegimenGetOneQuery, TicketRegimenPaginationQuery } from './request'

@ApiTags('TicketRegimen')
@ApiBearerAuth('access-token')
@Controller('ticket-regimen')
export class ApiTicketRegimenController {
  constructor(private readonly apiTicketRegimenService: ApiTicketRegimenService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketRegimenPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketRegimenService.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketRegimenGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketRegimenService.detail({ oid, id, query })
    return { data }
  }
}
