import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketProcedureService } from './api-ticket-procedure.service'
import { TicketProcedureGetOneQuery, TicketProcedurePaginationQuery } from './request'

@ApiTags('TicketProcedure')
@ApiBearerAuth('access-token')
@Controller('ticket-procedure')
export class ApiTicketProcedureController {
  constructor(private readonly apiTicketProcedureService: ApiTicketProcedureService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketProcedurePaginationQuery) {
    return await this.apiTicketProcedureService.pagination(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketProcedureGetOneQuery
  ) {
    return await this.apiTicketProcedureService.getOne(oid, id, query)
  }
}
