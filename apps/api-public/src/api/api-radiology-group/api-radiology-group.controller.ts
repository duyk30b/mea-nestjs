import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiRadiologyGroupService } from './api-radiology-group.service'
import {
  RadiologyGroupCreateBody,
  RadiologyGroupGetManyQuery,
  RadiologyGroupPaginationQuery,
  RadiologyGroupReplaceAllBody,
  RadiologyGroupUpdateBody,
} from './request'

@ApiTags('RadiologyGroup')
@ApiBearerAuth('access-token')
@Controller('radiology-group')
export class ApiRadiologyGroupController {
  constructor(private readonly apiRadiologyGroupService: ApiRadiologyGroupService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: RadiologyGroupPaginationQuery) {
    return this.apiRadiologyGroupService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: RadiologyGroupGetManyQuery) {
    return this.apiRadiologyGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiRadiologyGroupService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async createOne(@External() { oid }: TExternal, @Body() body: RadiologyGroupCreateBody) {
    return await this.apiRadiologyGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyGroupUpdateBody
  ) {
    return await this.apiRadiologyGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologyGroupService.destroyOne(oid, id)
  }

  @Put('replace-all')
  @HasPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async replaceAll(@External() { oid }: TExternal, @Body() body: RadiologyGroupReplaceAllBody) {
    return await this.apiRadiologyGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @IsUser()
  async systemList() {
    return await this.apiRadiologyGroupService.systemList()
  }
}
