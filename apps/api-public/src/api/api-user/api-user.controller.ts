import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiUserService } from './api-user.service'
import {
  UserCreateBody,
  UserGetManyQuery,
  UserGetOneQuery,
  UserPaginationQuery,
  UserUpdateBody,
} from './request'
import { DeviceLogoutBody } from './request/device-logout.query'
import { NewPasswordBody } from './request/new-password.body'

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class ApiUserController {
  constructor(private readonly apiUserService: ApiUserService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: UserPaginationQuery) {
    return this.apiUserService.pagination({ oid, query })
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: UserGetManyQuery) {
    return this.apiUserService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: UserGetOneQuery
  ) {
    return await this.apiUserService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.ACCOUNT_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: UserCreateBody) {
    return await this.apiUserService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.ACCOUNT_CRUD)
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: UserUpdateBody
  ) {
    return await this.apiUserService.updateOne(oid, +id, body)
  }

  @Patch('new-password/:id')
  @HasPermission(PermissionId.ACCOUNT_CRUD)
  async newPassword(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() { password }: NewPasswordBody
  ) {
    return await this.apiUserService.newPassword(oid, +id, password)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.ACCOUNT_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiUserService.deleteOne(oid, id)
  }

  @Post('device-logout/:id')
  @HasPermission(PermissionId.ACCOUNT_CRUD)
  deviceLogout(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DeviceLogoutBody
  ) {
    return this.apiUserService.deviceLogout({
      oid,
      userId: +id,
      refreshExp: body.refreshExp,
    })
  }
}
