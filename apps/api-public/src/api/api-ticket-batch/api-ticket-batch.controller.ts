import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketBatchService } from './api-ticket-batch.service'
import { TicketBatchGetManyQuery, TicketBatchPaginationQuery } from './request'

@ApiTags('TicketBatch')
@ApiBearerAuth('access-token')
@Controller('ticket-batch')
export class ApiTicketBatchController {
  constructor(private readonly apiTicketBatchService: ApiTicketBatchService) { }

  @Get('pagination')
  @HasPermission(PermissionId.PRODUCT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: TicketBatchPaginationQuery) {
    return await this.apiTicketBatchService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.PRODUCT_READ)
  async list(@External() { oid }: TExternal, @Query() query: TicketBatchGetManyQuery) {
    return await this.apiTicketBatchService.getList(oid, query)
  }
}
