import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
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
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  pagination(@External() { oid }: TExternal, @Query() query: DistributorPaginationQuery) {
    return this.apiDistributorService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  list(@External() { oid }: TExternal, @Query() query: DistributorGetManyQuery) {
    return this.apiDistributorService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiDistributorService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.DISTRIBUTOR_CREATE)
  async createOne(@External() { oid }: TExternal, @Body() body: DistributorCreateBody) {
    return await this.apiDistributorService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.DISTRIBUTOR_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DistributorUpdateBody
  ) {
    return await this.apiDistributorService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.DISTRIBUTOR_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiDistributorService.destroyOne(oid, id)
  }
}
