import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApiProductMovementService } from './api-product-movement.service'
import { ProductMovementPaginationQuery } from './request'

@ApiTags('Product Movement')
@ApiBearerAuth('access-token')
@Controller('product-movement')
export class ApiProductMovementController {
  constructor(private readonly apiProductMovementService: ApiProductMovementService) { }

  @Get('pagination')
  @UserPermission(PermissionId.PRODUCT_READ_MOVEMENT)
  async paginationProductMovement(
    @External() { oid }: TExternal,
    @Query() query: ProductMovementPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiProductMovementService.pagination(oid, query)
    return { data }
  }
}
