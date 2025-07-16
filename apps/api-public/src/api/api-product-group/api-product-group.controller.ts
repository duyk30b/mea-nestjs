import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiProductGroupService } from './api-product-group.service'
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
export class ApiProductGroupController {
  constructor(private readonly apiProductGroupService: ApiProductGroupService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PRODUCT)
  pagination(@External() { oid }: TExternal, @Query() query: ProductGroupPaginationQuery) {
    return this.apiProductGroupService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PRODUCT)
  list(@External() { oid }: TExternal, @Query() query: ProductGroupGetManyQuery) {
    return this.apiProductGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PRODUCT)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiProductGroupService.getOne(oid, id)
  }

  @Put('replace-all')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: ProductGroupReplaceAllBody
  ) {
    return await this.apiProductGroupService.replaceAll(oid, body)
  }

  @Post('create')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  async createOne(@External() { oid }: TExternal, @Body() body: ProductGroupCreateBody) {
    return await this.apiProductGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductGroupUpdateBody
  ) {
    return await this.apiProductGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductGroupService.destroyOne(oid, id)
  }
}
