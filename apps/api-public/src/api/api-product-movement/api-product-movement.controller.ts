import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiProductMovementService } from './api-product-movement.service'
import { ProductMovementPaginationQuery } from './request'

@ApiTags('Product Movement')
@ApiBearerAuth('access-token')
@Controller('product-movement')
export class ApiProductMovementController {
  constructor(private readonly apiProductMovementService: ApiProductMovementService) {}

  @Get('pagination')
  @HasPermission(PermissionId.READ_MOVEMENT)
  paginationProductMovement(
    @External() { oid }: TExternal,
    @Query() query: ProductMovementPaginationQuery
  ) {
    return this.apiProductMovementService.pagination(oid, query)
  }
}
