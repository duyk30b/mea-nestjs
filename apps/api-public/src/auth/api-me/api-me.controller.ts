import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { IsUser } from '../../guards/user.guard.'
import { ApiMeService } from './api-me.service'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@ApiTags('Me')
@ApiBearerAuth('access-token')
@Controller('me')
export class ApiMeController {
  constructor(private readonly apiUserService: ApiMeService) {}

  @Get('info')
  @IsUser()
  async info(@External() { oid, uid }: TExternal) {
    return await this.apiUserService.info(oid, uid)
  }

  @Patch('change-password')
  @IsUser()
  async detail(@External() { oid, uid }: TExternal, @Body() body: UserChangePasswordBody) {
    return await this.apiUserService.changePassword(oid, uid, body)
  }

  @Patch('update-info')
  @IsUser()
  async update(@External() { oid, uid }: TExternal, @Body() body: UserUpdateInfoBody) {
    return await this.apiUserService.updateInfo(oid, uid, body)
  }
}
