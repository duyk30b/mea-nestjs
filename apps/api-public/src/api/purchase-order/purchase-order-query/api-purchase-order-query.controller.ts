import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../../_libs/common/guards/organization.guard'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { ApiPurchaseOrderQueryService } from './purchase-order-query.service'
import {
  PurchaseOrderGetManyQuery,
  PurchaseOrderGetOneQuery,
  PurchaseOrderPaginationQuery,
} from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderQueryController {
  constructor(private readonly apiPurchaseOrderQueryService: ApiPurchaseOrderQueryService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PURCHASE_ORDER)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PurchaseOrderPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderQueryService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PURCHASE_ORDER)
  async list(
    @External() { oid }: TExternal,
    @Query() query: PurchaseOrderGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderQueryService.getMany(oid, query)
    return { data }
  }

  @Get('/:id/detail')
  @OrganizationPermission(PermissionId.PURCHASE_ORDER)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: PurchaseOrderGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderQueryService.getOne(oid, id, query)
    return { data }
  }
}
