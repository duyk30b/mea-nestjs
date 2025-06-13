import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiProductMovementService } from './api-product-movement.service'
import { ProductMovementPaginationQuery } from './request'

@ApiTags('Product Movement')
@ApiBearerAuth('access-token')
@Controller('product-movement')
export class ApiProductMovementController {
  constructor(private readonly apiProductMovementService: ApiProductMovementService) { }

  @Get('pagination')
  @UserPermission(PermissionId.PRODUCT_READ_MOVEMENT)
  paginationProductMovement(
    @External() { oid }: TExternal,
    @Query() query: ProductMovementPaginationQuery
  ) {
    return this.apiProductMovementService.pagination(oid, query)
  }
}
