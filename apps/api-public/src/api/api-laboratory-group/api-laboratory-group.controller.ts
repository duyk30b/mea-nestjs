import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
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
  @OrganizationPermission(PermissionId.LABORATORY)
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryGroupPaginationQuery) {
    return this.apiLaboratoryGroupService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.LABORATORY)
  list(@External() { oid }: TExternal, @Query() query: LaboratoryGroupGetManyQuery) {
    return this.apiLaboratoryGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.LABORATORY)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratoryGroupService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.LABORATORY_GROUP_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratoryGroupUpsertBody) {
    return await this.apiLaboratoryGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.LABORATORY_GROUP_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryGroupUpsertBody
  ) {
    return await this.apiLaboratoryGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.LABORATORY_GROUP_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryGroupService.destroyOne(oid, id)
  }

  @Put('replace-all')
  @UserPermission(PermissionId.LABORATORY_GROUP_CRUD)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: LaboratoryGroupReplaceAllBody
  ) {
    return await this.apiLaboratoryGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @UserPermission(PermissionId.LABORATORY_GROUP_CRUD)
  async systemList() {
    return await this.apiLaboratoryGroupService.systemList()
  }
}
