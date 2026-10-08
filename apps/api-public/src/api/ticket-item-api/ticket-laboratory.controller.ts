import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
} from '@api-public/resource/ticket-laboratory/ticket-laboratory-get.query'
import { TicketLaboratoryResource } from '@api-public/resource/ticket-laboratory/ticket-laboratory.resource'
import { GenerateIdParam } from '@libs/common/dto'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('TicketLaboratory')
@ApiBearerAuth('access-token')
@Controller('ticket-laboratory')
export class TicketLaboratoryController {
  constructor(private readonly ticketLaboratoryResource: TicketLaboratoryResource) {}

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketLaboratoryPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketLaboratoryResource.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketLaboratoryGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketLaboratoryResource.getOne(oid, id, query)
    return { data }
  }
}
