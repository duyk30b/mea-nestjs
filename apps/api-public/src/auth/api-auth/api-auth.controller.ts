import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiAuthService } from './api-auth.service'
import { ForgotPasswordBody } from './request/forgot-password.body'
import { LoginBody } from './request/login.body'
import { RefreshTokenBody } from './request/refresh-token.body'
import { ResetPasswordBody } from './request/reset-password.body'

@ApiTags('Auth')
@Controller('auth')
export class ApiAuthController {
  constructor(private readonly apiAuthService: ApiAuthService) {}

  // @Post('register')
  // async register(@Body() registerDto: RegisterBody, @External() { ip }: TExternal) {
  //   return await this.apiAuthService.register(registerDto, ip)
  // }

  @Post('login')
  async login(@Body() loginDto: LoginBody, @External() dataExternal: TExternal) {
    return await this.apiAuthService.login(loginDto, dataExternal)
  }

  @Post('login-demo')
  async loginDemo(@External() dataExternal: TExternal) {
    return await this.apiAuthService.loginDemo(dataExternal)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordBody) {
    return await this.apiAuthService.forgotPassword(body)
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordBody) {
    return await this.apiAuthService.resetPassword(body)
  }

  @Post('refresh-token')
  async grantAccessToken(@External() dataExternal: TExternal, @Body() body: RefreshTokenBody) {
    return await this.apiAuthService.grantAccessToken(body.refreshToken, dataExternal)
  }

  @Post('logout')
  async logout(@External() dataExternal: TExternal, @Body() body: RefreshTokenBody) {
    return this.apiAuthService.logout(body.refreshToken, dataExternal)
  }
}
