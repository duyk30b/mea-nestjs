import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiLaboratoryGroupService } from './api-laboratory-group.service'
import {
  LaboratoryGroupGetManyQuery,
  LaboratoryGroupPaginationQuery,
  LaboratoryGroupReplaceAllBody,
  LaboratoryGroupUpsertBody,
} from './request'

@ApiTags('LaboratoryGroup')
@ApiBearerAuth('access-token')
@Controller('laboratory-group')
export class ApiLaboratoryGroupController {
  constructor(private readonly apiLaboratoryGroupService: ApiLaboratoryGroupService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryGroupPaginationQuery) {
    return this.apiLaboratoryGroupService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: LaboratoryGroupGetManyQuery) {
    return this.apiLaboratoryGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratoryGroupService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratoryGroupUpsertBody) {
    return await this.apiLaboratoryGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryGroupUpsertBody
  ) {
    return await this.apiLaboratoryGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryGroupService.destroyOne(oid, id)
  }

  @Put('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: LaboratoryGroupReplaceAllBody
  ) {
    return await this.apiLaboratoryGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async systemList() {
    return await this.apiLaboratoryGroupService.systemList()
  }
}
