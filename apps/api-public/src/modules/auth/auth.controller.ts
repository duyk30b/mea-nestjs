import { Body, Controller, Param, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtExtendService } from '../../components/jwt-extend/jwt-extend.service'
import { IpRequest } from '../../decorators/request.decorator'
import { AuthService } from './auth.service'
import { ForgotPasswordBody } from './request/forgot-password.body'
import { LoginBody } from './request/login.body'
import { RefreshTokenBody } from './request/refresh-token.body'
import { RegisterBody } from './request/register.body'
import { ResetPasswordBody } from './request/reset-password.body'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly jwtExtendService: JwtExtendService
	) { }

	@Post('register')
	async register(@Body() registerDto: RegisterBody, @IpRequest() ip: string) {
		const employee = await this.authService.register(registerDto)
		const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip)
		return {
			user: employee,
			access_token: accessToken,
			refresh_token: refreshToken,
		}
	}

	@Post('login')
	async login(@Body() loginDto: LoginBody, @IpRequest() ip: string) {
		const employee = await this.authService.login(loginDto)
		const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip)
		return {
			user: employee,
			access_token: accessToken,
			refresh_token: refreshToken,
		}
	}

	@Post('login-demo')
	async loginDemo(@IpRequest() ip: string) {
		const employee = await this.authService.loginDemo()
		const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip)
		return {
			user: employee,
			access_token: accessToken,
			refresh_token: refreshToken,
		}
	}

	@Post('logout')
	async logout(@Param('id') id: string) {
		// return this.authService.findOne(+id)
	}

	@Post('forgot-password')
	async forgotPassword(@Body() body: ForgotPasswordBody) {
		return await this.authService.forgotPassword(body)
	}

	@Post('reset-password')
	async resetPassword(@Body() body: ResetPasswordBody) {
		return await this.authService.resetPassword(body)
	}

	@Post('refresh-token')
	async grantAccessToken(@Body() refreshTokenDto: RefreshTokenBody, @IpRequest() ip: string) {
		const accessToken = await this.authService.grantAccessToken(refreshTokenDto.refreshToken, ip)
		return { access_token: accessToken }
	}
}
