import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
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
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: WarehousePaginationQuery
  ): Promise<BaseResponse> {
    const data = this.apiWarehouseService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: WarehouseGetManyQuery) {
    return this.apiWarehouseService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiWarehouseService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  async createOne(@External() { oid }: TExternal, @Body() body: WarehouseCreateBody) {
    return await this.apiWarehouseService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: WarehouseUpdateBody
  ) {
    return await this.apiWarehouseService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_WAREHOUSE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiWarehouseService.destroyOne({ oid, warehouseId: id })
    return { data }
  }
}
