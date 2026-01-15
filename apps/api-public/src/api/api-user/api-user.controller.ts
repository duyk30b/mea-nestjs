import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
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
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: UserPaginationQuery
  ): Promise<BaseResponse> {
    const data = this.apiUserService.pagination({ oid, query })
    return { data }
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: UserGetManyQuery) {
    return this.apiUserService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: UserGetOneQuery
  ) {
    return await this.apiUserService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.USER_ACCOUNT_CREATE)
  async createOne(@External() { oid }: TExternal, @Body() body: UserCreateBody) {
    return await this.apiUserService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.USER_ACCOUNT_UPDATE)
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: UserUpdateBody
  ) {
    return await this.apiUserService.updateOne(oid, +id, body)
  }

  @Post('new-password/:id')
  @UserPermission(PermissionId.USER_ACCOUNT_CHANGE_PASSWORD)
  async newPassword(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() { password }: NewPasswordBody
  ) {
    return await this.apiUserService.newPassword(oid, +id, password)
  }

  @Post('delete/:id')
  @UserPermission(PermissionId.USER_ACCOUNT_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiUserService.deleteOne(oid, id)
  }

  @Post('device-logout/:id')
  @UserPermission(PermissionId.USER_ACCOUNT_LOGOUT)
  deviceLogout(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DeviceLogoutBody
  ) {
    return this.apiUserService.deviceLogout({
      oid,
      userId: +id,
      clientId: body.clientId,
    })
  }
}
