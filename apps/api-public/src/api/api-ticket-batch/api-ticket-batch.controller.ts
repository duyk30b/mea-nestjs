import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketBatchService } from './api-ticket-batch.service'
import { TicketBatchGetManyQuery, TicketBatchPaginationQuery } from './request'

@ApiTags('TicketBatch')
@ApiBearerAuth('access-token')
@Controller('ticket-batch')
export class ApiTicketBatchController {
  constructor(private readonly apiTicketBatchService: ApiTicketBatchService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketBatchPaginationQuery) {
    return await this.apiTicketBatchService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: TicketBatchGetManyQuery) {
    return await this.apiTicketBatchService.getList(oid, query)
  }
}
