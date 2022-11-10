import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TUserReq, UserReq } from '../../decorators/request.decorator'
import { ApiUserService } from './api-user.service'
import { UserChangePasswordBody } from './request/user-change-password.body'
import { UserUpdateInfoBody } from './request/user-update-info.body'

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class ApiUserController {
	constructor(private readonly apiUserService: ApiUserService) { }

	@Get('me')
	async me(@UserReq() userReq: TUserReq) {
		return await this.apiUserService.me(userReq.oid, userReq.id)
	}

	@Patch('change-password')
	async detail(@UserReq() userReq: TUserReq, @Body() body: UserChangePasswordBody) {
		return await this.apiUserService.changePassword(userReq.oid, userReq.id, body)
	}

	@Patch('update-info')
	async update(@UserReq() userReq: TUserReq, @Body() body: UserUpdateInfoBody) {
		return await this.apiUserService.updateInfo(userReq.oid, userReq.id, body)
	}
}
