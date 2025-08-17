import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'
import {
  TicketRegimenGetOneQuery,
  TicketRegimenPaginationQuery,
} from './request'

@ApiTags('TicketRegimen')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRegimenController {
  constructor(private readonly apiTicketRegimenService: ApiTicketRegimenService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketRegimenPaginationQuery) {
    return await this.apiTicketRegimenService.pagination(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketRegimenGetOneQuery
  ) {
    return await this.apiTicketRegimenService.getOne(oid, id, query)
  }
}
