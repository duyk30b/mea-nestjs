import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { IsPermission } from '../../guards/permission.guard'
import { ApiUserService } from './api-user.service'
import {
  UserCreateBody,
  UserGetManyQuery,
  UserGetOneQuery,
  UserPaginationQuery,
  UserUpdateBody,
} from './request'

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class ApiUserController {
  constructor(private readonly apiUserService: ApiUserService) {}

  @Get('pagination')
  @IsPermission(PermissionId.USER_LIST)
  pagination(@External() { oid }: TExternal, @Query() query: UserPaginationQuery) {
    return this.apiUserService.pagination(oid, query)
  }

  @Get('list')
  @IsPermission(PermissionId.USER_LIST)
  list(@External() { oid }: TExternal, @Query() query: UserGetManyQuery) {
    return this.apiUserService.getMany(oid, query)
  }

  @Get('detail/:id')
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: UserGetOneQuery
  ) {
    return await this.apiUserService.getOne(oid, id, query)
  }

  @Post('create')
  async create(@External() { oid }: TExternal, @Body() body: UserCreateBody) {
    return await this.apiUserService.createOne(oid, body)
  }

  @Patch('update/:id')
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: UserUpdateBody
  ) {
    return await this.apiUserService.updateOne(oid, +id, body)
  }

  @Delete('delete/:id')
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiUserService.deleteOne(oid, id)
  }
}
