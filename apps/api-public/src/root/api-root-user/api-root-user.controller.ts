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
import { UserGroup } from '../../../../_libs/database/entities/user.entity'
import { IsRoot } from '../../guards/root.guard'
import { ApiRootUserService } from './api-root-user.service'
import { DeviceLogoutBody } from './request/device-logout.query'
import { RootUserPaginationQuery } from './request/root-user-get.query'
import { RootUserCreateBody, RootUserUpdateBody } from './request/root-user-upsert.body'

@Controller('root')
@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
@SerializeOptions({ groups: [UserGroup.ROOT] })
export class ApiRootUserController {
  constructor(private readonly apiRootUserService: ApiRootUserService) {}

  @Get('user/pagination')
  userPagination(@Query() query: RootUserPaginationQuery) {
    return this.apiRootUserService.pagination(query)
  }

  @Post('user/create')
  async createOne(@Body() body: RootUserCreateBody) {
    return await this.apiRootUserService.createOne(body)
  }

  @Patch('user/update/:id')
  @ApiParam({ name: 'id', example: 1 })
  async userUpdateOne(@Param() { id }: IdParam, @Body() body: RootUserUpdateBody) {
    return await this.apiRootUserService.updateOne(id, body)
  }

  @Delete('user/delete/:id')
  @ApiParam({ name: 'id', example: 1 })
  async userDeleteOne(@Param() { id }: IdParam) {
    return await this.apiRootUserService.deleteOne(id)
  }

  @Post('user/device-logout/:id')
  deviceLogout(@Param() { id }: IdParam, @Body() body: DeviceLogoutBody) {
    return this.apiRootUserService.deviceLogout({
      oid: body.oid,
      userId: +id,
      code: body.code,
    })
  }
}
