import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { UserGroup } from '../../../../_libs/database/entities/user.entity'
import { ApiRootUserService } from './api-root-user.service'
import { DeviceLogoutBody } from './request/device-logout.query'
import { RootUserPaginationQuery } from './request/root-user-get.query'
import { RootUserCreateBody, RootUserUpdateBody } from './request/root-user-upsert.body'

@Controller('root/user')
@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
@SerializeOptions({ groups: [UserGroup.ROOT] })
export class ApiRootUserController {
  constructor(private readonly apiRootUserService: ApiRootUserService) { }

  @Get('pagination')
  pagination(@Query() query: RootUserPaginationQuery) {
    return this.apiRootUserService.pagination(query)
  }

  @Post('create')
  async create(@Body() body: RootUserCreateBody) {
    return await this.apiRootUserService.create(body)
  }

  @Patch('update/:id')
  @ApiParam({ name: 'id', example: 1 })
  async update(@Param() { id }: IdParam, @Body() body: RootUserUpdateBody) {
    return await this.apiRootUserService.update(id, body)
  }

  @Delete('delete/:id')
  @ApiParam({ name: 'id', example: 1 })
  async userDeleteOne(@Param() { id }: IdParam) {
    return await this.apiRootUserService.deleteOne(id)
  }

  @Post('device-logout/:id')
  deviceLogout(@Param() { id }: IdParam, @Body() body: DeviceLogoutBody) {
    return this.apiRootUserService.deviceLogout({
      oid: body.oid,
      userId: +id,
      refreshExp: body.refreshExp,
    })
  }

  @Post('logout-all')
  logoutAll() {
    return this.apiRootUserService.logoutAll()
  }
}
