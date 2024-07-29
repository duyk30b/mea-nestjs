import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiDistributorService } from './api-distributor.service'
import {
  DistributorCreateBody,
  DistributorGetManyQuery,
  DistributorPaginationQuery,
  DistributorUpdateBody,
} from './request'

@ApiTags('Distributor')
@ApiBearerAuth('access-token')
@Controller('distributor')
export class ApiDistributorController {
  constructor(private readonly apiDistributorService: ApiDistributorService) { }

  @Get('pagination')
  @HasPermission(PermissionId.DISTRIBUTOR_READ)
  pagination(@External() { oid }: TExternal, @Query() query: DistributorPaginationQuery) {
    return this.apiDistributorService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.DISTRIBUTOR_READ)
  list(@External() { oid }: TExternal, @Query() query: DistributorGetManyQuery) {
    return this.apiDistributorService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.DISTRIBUTOR_READ)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiDistributorService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.DISTRIBUTOR_CREATE)
  async createOne(@External() { oid }: TExternal, @Body() body: DistributorCreateBody) {
    return await this.apiDistributorService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.DISTRIBUTOR_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DistributorUpdateBody
  ) {
    return await this.apiDistributorService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.DISTRIBUTOR_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiDistributorService.destroyOne(oid, id)
  }
}
