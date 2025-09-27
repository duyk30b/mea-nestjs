import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketLaboratoryService } from './api-ticket-laboratory.service'
import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
} from './request'

@ApiTags('TicketLaboratory')
@ApiBearerAuth('access-token')
@Controller('ticket-laboratory')
export class ApiTicketLaboratoryController {
  constructor(private readonly apiTicketLaboratoryService: ApiTicketLaboratoryService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketLaboratoryPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketLaboratoryService.pagination(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: TicketLaboratoryGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketLaboratoryService.getOne(oid, id, query)
    return { data }
  }
}
