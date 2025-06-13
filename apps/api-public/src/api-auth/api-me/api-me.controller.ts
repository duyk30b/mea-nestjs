import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiMeService } from './api-me.service'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@ApiTags('Me')
@ApiBearerAuth('access-token')
@Controller('me')
export class ApiMeController {
  constructor(private readonly apiUserService: ApiMeService) { }

  @Get('info')
  @UserPermission()
  async info(@External() { oid, uid, permissionIds }: TExternal) {
    return await this.apiUserService.info({ oid, uid, permissionIds })
  }

  @Patch('change-password')
  @UserPermission()
  async detail(@External() { oid, uid }: TExternal, @Body() body: UserChangePasswordBody) {
    return await this.apiUserService.changePassword(oid, uid, body)
  }

  @Patch('update-info')
  @UserPermission()
  async updateInfo(@External() { oid, uid }: TExternal, @Body() body: UserUpdateInfoBody) {
    return await this.apiUserService.updateInfo(oid, uid, body)
  }
}
