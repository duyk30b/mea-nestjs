import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApiTicketBatchService } from './api-ticket-batch.service'
import { TicketBatchGetManyQuery, TicketBatchPaginationQuery } from './request'

@ApiTags('TicketBatch')
@ApiBearerAuth('access-token')
@Controller('ticket-batch')
export class ApiTicketBatchController {
  constructor(private readonly apiTicketBatchService: ApiTicketBatchService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketBatchPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketBatchService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: TicketBatchGetManyQuery) {
    return await this.apiTicketBatchService.getList(oid, query)
  }
}
