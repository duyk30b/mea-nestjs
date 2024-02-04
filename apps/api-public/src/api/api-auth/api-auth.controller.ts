import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { JwtExtendService } from '../../components/jwt-extend/jwt-extend.service'
import { ApiAuthService } from './api-auth.service'
import { ForgotPasswordBody } from './request/forgot-password.body'
import { LoginBody } from './request/login.body'
import { RefreshTokenBody } from './request/refresh-token.body'
import { RegisterBody } from './request/register.body'
import { ResetPasswordBody } from './request/reset-password.body'

@ApiTags('Auth')
@Controller('auth')
export class ApiAuthController {
  constructor(private readonly apiAuthService: ApiAuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterBody, @External() { ip }: TExternal) {
    return await this.apiAuthService.register(registerDto, ip)
  }

  @Post('login')
  async login(@Body() loginDto: LoginBody, @External() { ip }: TExternal) {
    return await this.apiAuthService.login(loginDto, ip)
  }

  @Post('login-demo')
  async loginDemo(@External() { ip }: TExternal) {
    return await this.apiAuthService.loginDemo(ip)
  }

  @Delete('refresh-demo')
  async refreshDemo(@External() { ip }: TExternal) {
    return await this.apiAuthService.refreshDemo()
  }

  @Post('logout')
  async logout(@Param('id') id: string) {
    // return this.apiAuthService.findOne(+id)
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
  async grantAccessToken(@Body() body: RefreshTokenBody, @External() { ip }: TExternal) {
    return await this.apiAuthService.grantAccessToken(body.refreshToken, ip)
  }
}
