import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
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
  constructor(private readonly apiRoleService: ApiRoleService) {}

  @Get('pagination')
  pagination(@External() { oid }: TExternal, @Query() query: RolePaginationQuery) {
    return this.apiRoleService.pagination(oid, query)
  }

  @Get('list')
  list(@External() { oid }: TExternal, @Query() query: RoleGetManyQuery) {
    return this.apiRoleService.getMany(oid, query)
  }

  @Get('detail/:id')
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RoleGetOneQuery
  ) {
    return await this.apiRoleService.getOne(oid, id, query)
  }

  @Post('create')
  async create(@External() { oid }: TExternal, @Body() body: RoleCreateBody) {
    return await this.apiRoleService.createOne(oid, body)
  }

  @Patch('update/:id')
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RoleUpdateBody
  ) {
    return await this.apiRoleService.updateOne(oid, +id, body)
  }

  @Delete('delete/:id')
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRoleService.deleteOne(oid, id)
  }
}
