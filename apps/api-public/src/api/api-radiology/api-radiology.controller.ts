import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRadiologyService } from './api-radiology.service'
import {
  RadiologyGetManyQuery,
  RadiologyGetOneQuery,
  RadiologyPaginationQuery,
  RadiologySystemCopyBody,
  RadiologyUpsertBody,
} from './request'

@ApiTags('Radiology')
@ApiBearerAuth('access-token')
@Controller('radiology')
export class ApiRadiologyController {
  constructor(private readonly apiRadiologyService: ApiRadiologyService) { }

  @Get('pagination')
  @OrganizationPermission()
  pagination(@External() { oid }: TExternal, @Query() query: RadiologyPaginationQuery) {
    return this.apiRadiologyService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission()
  async list(@External() { oid }: TExternal, @Query() query: RadiologyGetManyQuery) {
    return await this.apiRadiologyService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RadiologyGetOneQuery
  ) {
    return await this.apiRadiologyService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.RADIOLOGY_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: RadiologyUpsertBody) {
    return await this.apiRadiologyService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.RADIOLOGY_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyUpsertBody
  ) {
    return await this.apiRadiologyService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.RADIOLOGY_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologyService.destroyOne(oid, id)
  }

  @Get('system-list')
  @UserPermission()
  async systemList() {
    return await this.apiRadiologyService.systemList()
  }

  @Post('system-copy')
  @UserPermission(PermissionId.RADIOLOGY_CREATE)
  async systemCopy(@External() { oid }: TExternal, @Body() body: RadiologySystemCopyBody) {
    return await this.apiRadiologyService.systemCopy(oid, body)
  }
}
