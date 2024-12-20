import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: RolePaginationQuery) {
    return this.apiRoleService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: RoleGetManyQuery) {
    return this.apiRoleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RoleGetOneQuery
  ) {
    return await this.apiRoleService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.ROLE_CRUD)
  async create(@External() { oid }: TExternal, @Body() body: RoleCreateBody) {
    return await this.apiRoleService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.ROLE_CRUD)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RoleUpdateBody
  ) {
    return await this.apiRoleService.updateOne(oid, +id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.ROLE_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRoleService.destroyOne(oid, id)
  }
}
