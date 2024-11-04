import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiProductGroupService } from './api-product-group.service'
import {
  ProductGroupCreateBody,
  ProductGroupGetManyQuery,
  ProductGroupPaginationQuery,
  ProductGroupUpdateBody,
} from './request'

@ApiTags('ProductGroup')
@ApiBearerAuth('access-token')
@Controller('product-group')
export class ApiProductGroupController {
  constructor(private readonly apiProductGroupService: ApiProductGroupService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: ProductGroupPaginationQuery) {
    return this.apiProductGroupService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: ProductGroupGetManyQuery) {
    return this.apiProductGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiProductGroupService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PRODUCT_GROUP)
  async createOne(@External() { oid }: TExternal, @Body() body: ProductGroupCreateBody) {
    return await this.apiProductGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PRODUCT_GROUP)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductGroupUpdateBody
  ) {
    return await this.apiProductGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PRODUCT_GROUP)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductGroupService.destroyOne(oid, id)
  }
}
