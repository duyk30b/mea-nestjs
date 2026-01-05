import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { RadiologyGroupService } from './radiology-group.service'
import {
  RadiologyGroupGetManyQuery,
  RadiologyGroupPaginationQuery,
  RadiologyGroupReplaceAllBody,
  RadiologyGroupUpsertBody,
} from './request'

@ApiTags('RadiologyGroup')
@ApiBearerAuth('access-token')
@Controller('radiology-group')
export class RadiologyGroupController {
  constructor(private readonly radiologyGroupService: RadiologyGroupService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: RadiologyGroupPaginationQuery) {
    return this.radiologyGroupService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: RadiologyGroupGetManyQuery) {
    return this.radiologyGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.radiologyGroupService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async createOne(@External() { oid }: TExternal, @Body() body: RadiologyGroupUpsertBody) {
    return await this.radiologyGroupService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyGroupUpsertBody
  ) {
    return await this.radiologyGroupService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.radiologyGroupService.destroyOne(oid, id)
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async replaceAll(@External() { oid }: TExternal, @Body() body: RadiologyGroupReplaceAllBody) {
    return await this.radiologyGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async systemList() {
    return await this.radiologyGroupService.systemList()
  }
}
