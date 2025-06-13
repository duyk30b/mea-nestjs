import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiProductService } from './api-product.service'
import {
  ProductCreateBody,
  ProductGetManyQuery,
  ProductGetOneQuery,
  ProductMergeBody,
  ProductPaginationQuery,
  ProductUpdateBody,
} from './request'

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Controller('product')
export class ApiProductController {
  constructor(private readonly apiProductService: ApiProductService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PRODUCT)
  pagination(@External() { oid }: TExternal, @Query() query: ProductPaginationQuery) {
    return this.apiProductService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PRODUCT)
  async list(@External() { oid }: TExternal, @Query() query: ProductGetManyQuery) {
    return await this.apiProductService.getList(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PRODUCT)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProductGetOneQuery
  ) {
    return await this.apiProductService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.PRODUCT_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: ProductCreateBody) {
    return await this.apiProductService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductUpdateBody
  ) {
    return await this.apiProductService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PRODUCT_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid, organization }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductService.destroyOne({ organization, oid, productId: id })
  }

  @Patch('merge-product')
  @UserPermission(PermissionId.PRODUCT_MERGE)
  async mergeProduct(
    @External() { oid, uid, organization }: TExternal,
    @Body() body: ProductMergeBody
  ) {
    return await this.apiProductService.mergeProduct({ oid, body, userId: uid })
  }
}
