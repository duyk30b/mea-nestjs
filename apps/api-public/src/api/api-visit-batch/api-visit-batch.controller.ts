import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiVisitBatchService } from './api-visit-batch.service'
import { VisitBatchGetManyQuery } from './request'

@ApiTags('Visit Batch')
@ApiBearerAuth('access-token')
@Controller('visit-batch')
export class ApiVisitBatchController {
  constructor(private readonly apiVisitBatchService: ApiVisitBatchService) {}

  @Get('list')
  @HasPermission(PermissionId.CUSTOMER_READ)
  list(@External() { oid }: TExternal, @Query() query: VisitBatchGetManyQuery) {
    return this.apiVisitBatchService.getMany(oid, query)
  }
}
