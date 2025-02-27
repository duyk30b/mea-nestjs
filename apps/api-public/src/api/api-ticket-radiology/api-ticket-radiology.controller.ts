import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import {
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
} from './request'

@ApiTags('TicketRadiology')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRadiologyController {
  constructor(private readonly apiTicketRadiologyService: ApiTicketRadiologyService) { }

  @Get('pagination')
  @IsUser()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketRadiologyPaginationQuery) {
    return await this.apiTicketRadiologyService.pagination(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketRadiologyGetOneQuery
  ) {
    return await this.apiTicketRadiologyService.getOne(oid, id, query)
  }
}
