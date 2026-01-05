import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRoleService } from './api-role.service'
import {
  RoleCreateBody,
  RoleGetManyQuery,
  RoleGetOneQuery,
  RolePaginationQuery,
  RoleUpdateBody,
} from './request'

@ApiTags('Role')
@ApiBearerAuth('access-token')
@Controller('role')
export class ApiRoleController {
  constructor(private readonly apiRoleService: ApiRoleService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: RolePaginationQuery) {
    return this.apiRoleService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: RoleGetManyQuery) {
    return this.apiRoleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RoleGetOneQuery
  ) {
    return await this.apiRoleService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.USER_ROLE_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: RoleCreateBody) {
    return await this.apiRoleService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.USER_ROLE_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RoleUpdateBody
  ) {
    return await this.apiRoleService.updateOne(oid, +id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.USER_ROLE_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRoleService.destroyOne(oid, id)
  }
}
