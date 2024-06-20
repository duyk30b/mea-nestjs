import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiBatchMovementService } from './api-batch-movement.service'
import { BatchMovementGetManyQuery, BatchMovementPaginationQuery } from './request'

@ApiTags('Batch Movement')
@ApiBearerAuth('access-token')
@Controller('batch-movement')
export class ApiBatchMovementController {
  constructor(private readonly apiBatchMovementService: ApiBatchMovementService) {}

  @Get('pagination')
  @HasPermission(PermissionId.READ_MOVEMENT)
  paginationBatchMovement(
    @External() { oid }: TExternal,
    @Query() query: BatchMovementPaginationQuery
  ) {
    return this.apiBatchMovementService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.CUSTOMER_READ)
  list(@External() { oid }: TExternal, @Query() query: BatchMovementGetManyQuery) {
    return this.apiBatchMovementService.getMany(oid, query)
  }
}
