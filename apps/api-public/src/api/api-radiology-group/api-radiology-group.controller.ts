import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRadiologyGroupService } from './api-radiology-group.service'
import {
  RadiologyGroupGetManyQuery,
  RadiologyGroupPaginationQuery,
  RadiologyGroupReplaceAllBody,
  RadiologyGroupUpsertBody,
} from './request'

@ApiTags('RadiologyGroup')
@ApiBearerAuth('access-token')
@Controller('radiology-group')
export class ApiRadiologyGroupController {
  constructor(private readonly apiRadiologyGroupService: ApiRadiologyGroupService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.RADIOLOGY)
  pagination(@External() { oid }: TExternal, @Query() query: RadiologyGroupPaginationQuery) {
    return this.apiRadiologyGroupService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.RADIOLOGY)
  list(@External() { oid }: TExternal, @Query() query: RadiologyGroupGetManyQuery) {
    return this.apiRadiologyGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.RADIOLOGY)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiRadiologyGroupService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.RADIOLOGY_GROUP_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: RadiologyGroupUpsertBody) {
    return await this.apiRadiologyGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.RADIOLOGY_GROUP_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyGroupUpsertBody
  ) {
    return await this.apiRadiologyGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.RADIOLOGY_GROUP_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologyGroupService.destroyOne(oid, id)
  }

  @Put('replace-all')
  @UserPermission(PermissionId.RADIOLOGY_GROUP_CRUD)
  async replaceAll(@External() { oid }: TExternal, @Body() body: RadiologyGroupReplaceAllBody) {
    return await this.apiRadiologyGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @UserPermission(PermissionId.RADIOLOGY_GROUP_CRUD)
  async systemList() {
    return await this.apiRadiologyGroupService.systemList()
  }
}
