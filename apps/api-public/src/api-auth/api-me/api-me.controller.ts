import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiMeService } from './api-me.service'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@ApiTags('Me')
@ApiBearerAuth('access-token')
@Controller('me')
export class ApiMeController {
  constructor(private readonly apiUserService: ApiMeService) { }

  @Get('info')
  @IsUser()
  async info(@External() { oid, uid, permissionIds }: TExternal) {
    return await this.apiUserService.info({ oid, uid, permissionIds })
  }

  @Patch('change-password')
  @IsUser()
  async detail(@External() { oid, uid }: TExternal, @Body() body: UserChangePasswordBody) {
    return await this.apiUserService.changePassword(oid, uid, body)
  }

  @Patch('update-info')
  @IsUser()
  async updateInfo(@External() { oid, uid }: TExternal, @Body() body: UserUpdateInfoBody) {
    return await this.apiUserService.updateInfo(oid, uid, body)
  }
}
