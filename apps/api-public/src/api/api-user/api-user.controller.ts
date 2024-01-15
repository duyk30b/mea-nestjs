import { Body, Controller, Get, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiUserService } from './api-user.service'
import { UserChangePasswordBody, UserPaginationQuery, UserUpdateInfoBody } from './request'

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class ApiUserController {
    constructor(private readonly apiUserService: ApiUserService) {}

    @Get('pagination')
    pagination(@External() { oid }: TExternal, @Query() query: UserPaginationQuery) {
        return this.apiUserService.pagination(oid, query)
    }

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
