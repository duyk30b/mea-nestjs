import { Controller, Get } from '@nestjs/common'
import { Param, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam, IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { TicketReceptionGetOneQuery, TicketReceptionPaginationQuery } from './request'
import { TicketReceptionService } from './ticket-reception.service'

@ApiTags('TicketReception')
@ApiBearerAuth('access-token')
@Controller('ticket-reception')
export class TicketReceptionController {
  constructor(private readonly ticketReceptionService: TicketReceptionService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketReceptionPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketReceptionService.pagination({ oid, query })
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketReceptionGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketReceptionService.detail({ oid, id, query })
    return { data }
  }
}
