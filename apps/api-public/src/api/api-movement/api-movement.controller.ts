import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiMovementService } from './api-movement.service'
import { BatchMovementPaginationQuery, ProductMovementPaginationQuery } from './request'

@ApiTags('Movement')
@ApiBearerAuth('access-token')
@Controller('movement')
export class ApiMovementController {
  constructor(private readonly apiMovementService: ApiMovementService) {}

  @Get('pagination-batch')
  @HasPermission(PermissionId.READ_MOVEMENT)
  paginationBatchMovement(
    @External() { oid }: TExternal,
    @Query() query: BatchMovementPaginationQuery
  ) {
    return this.apiMovementService.paginationBatchMovement(oid, query)
  }

  @Get('pagination-product')
  @HasPermission(PermissionId.READ_MOVEMENT)
  paginationProductMovement(
    @External() { oid }: TExternal,
    @Query() query: ProductMovementPaginationQuery
  ) {
    return this.apiMovementService.paginationProductMovement(oid, query)
  }
}
