import {
  TicketProcedureGetOneQuery,
  TicketProcedurePaginationQuery,
} from '@api-public/resource/ticket-procedure/ticket-procedure-get.query'
import { TicketProcedureResource } from '@api-public/resource/ticket-procedure/ticket-procedure.resource'
import { GenerateIdParam } from '@libs/common/dto'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('TicketProcedure')
@ApiBearerAuth('access-token')
@Controller('ticket-procedure')
export class TicketProcedureController {
  constructor(private readonly ticketProcedureResource: TicketProcedureResource) {}

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketProcedurePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketProcedureResource.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketProcedureGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketProcedureResource.detail({ oid, id, query })
    return { data }
  }
}
