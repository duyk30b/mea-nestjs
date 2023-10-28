import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
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
  constructor(private readonly apiUserService: ApiUserService) {}

  @Get('pagination')
  @HasPermission(PermissionId.USER_READ)
  pagination(@External() { oid }: TExternal, @Query() query: UserPaginationQuery) {
    return this.apiUserService.pagination({ oid, query })
  }

  @Get('list')
  @HasPermission(PermissionId.USER_READ)
  list(@External() { oid }: TExternal, @Query() query: UserGetManyQuery) {
    return this.apiUserService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.USER_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: UserGetOneQuery
  ) {
    return await this.apiUserService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.USER_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: UserCreateBody) {
    return await this.apiUserService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.USER_UPDATE)
  async updateInfo(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: UserUpdateBody
  ) {
    return await this.apiUserService.updateInfo(oid, +id, body)
  }

  @Patch('new-password/:id')
  @HasPermission(PermissionId.USER_UPDATE)
  async newPassword(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() { password }: NewPasswordBody
  ) {
    return await this.apiUserService.newPassword(oid, +id, password)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.USER_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiUserService.deleteOne(oid, id)
  }

  @Post('device-logout/:id')
  @HasPermission(PermissionId.USER_DEVICE_LOGOUT)
  deviceLogout(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DeviceLogoutBody
  ) {
    return this.apiUserService.deviceLogout({
      oid,
      userId: +id,
      code: body.code,
    })
  }
}
