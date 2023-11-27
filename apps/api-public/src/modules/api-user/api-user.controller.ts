import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiUserService } from './api-user.service'
import { UserChangePasswordBody } from './request/user-change-password.body'
import { UserUpdateInfoBody } from './request/user-update-info.body'

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class ApiUserController {
    constructor(private readonly apiUserService: ApiUserService) {}

    @Get('me')
    async me(@External() { oid, uid }: TExternal) {
        return await this.apiUserService.me(oid, uid)
    }

    @Patch('change-password')
    async detail(@External() { oid, uid }: TExternal, @Body() body: UserChangePasswordBody) {
        return await this.apiUserService.changePassword(oid, uid, body)
    }

    @Patch('update-info')
    async update(@External() { oid, uid }: TExternal, @Body() body: UserUpdateInfoBody) {
        return await this.apiUserService.updateInfo(oid, uid, body)
    }
}
