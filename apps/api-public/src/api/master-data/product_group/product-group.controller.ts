import { IdParam } from '@libs/common/dto/param'
import { OrganizationPermission } from '@libs/common/guards/organization.guard'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { ProductGroupService } from './product-group.service'
import {
    ProductGroupCreateBody,
    ProductGroupGetManyQuery,
    ProductGroupPaginationQuery,
    ProductGroupReplaceAllBody,
    ProductGroupUpdateBody,
} from './request'

@ApiTags('ProductGroup')
@ApiBearerAuth('access-token')
@Controller('product-group')
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PRODUCT)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: ProductGroupPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.productGroupService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PRODUCT)
  list(@External() { oid }: TExternal, @Query() query: ProductGroupGetManyQuery) {
    return this.productGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PRODUCT)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.productGroupService.getOne(oid, id)
  }

  @Post('replace-all')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  async replaceAll(@External() { oid }: TExternal, @Body() body: ProductGroupReplaceAllBody) {
    return await this.productGroupService.replaceAll(oid, body)
  }

  @Post('create')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  async createOne(@External() { oid }: TExternal, @Body() body: ProductGroupCreateBody) {
    return await this.productGroupService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductGroupUpdateBody
  ) {
    return await this.productGroupService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.productGroupService.destroyOne(oid, id)
  }
}
