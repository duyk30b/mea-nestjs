import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPurchaseOrderItemService } from './api-purchase-order-item.service'
import { PurchaseOrderItemPaginationQuery } from './request'

@ApiTags('PurchaseOrderItem')
@ApiBearerAuth('access-token')
@Controller('purchase-order-item')
export class ApiPurchaseOrderItemController {
  constructor(private readonly apiPurchaseOrderItemService: ApiPurchaseOrderItemService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PURCHASE_ORDER)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PurchaseOrderItemPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderItemService.pagination(oid, query)
    return { data }
  }
}
