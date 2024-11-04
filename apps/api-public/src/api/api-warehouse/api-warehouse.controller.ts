import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiWarehouseService } from './api-warehouse.service'
import {
  WarehouseCreateBody,
  WarehouseGetManyQuery,
  WarehousePaginationQuery,
  WarehouseUpdateBody,
} from './request'

@ApiTags('Warehouse')
@ApiBearerAuth('access-token')
@Controller('warehouse')
export class ApiWarehouseController {
  constructor(private readonly apiWarehouseService: ApiWarehouseService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: WarehousePaginationQuery) {
    return this.apiWarehouseService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: WarehouseGetManyQuery) {
    return this.apiWarehouseService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiWarehouseService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  async createOne(@External() { oid }: TExternal, @Body() body: WarehouseCreateBody) {
    return await this.apiWarehouseService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: WarehouseUpdateBody
  ) {
    return await this.apiWarehouseService.updateOne(oid, id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiWarehouseService.deleteOne(oid, id)
  }
}
