import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiAuthService } from './api-auth.service'
import {
  ForgotPasswordBody,
  LoginBody,
  LoginRootBody,
  LogoutBody,
  RefreshTokenBody,
  ResetPasswordBody,
} from './request'

@ApiTags('Auth')
@Controller('auth')
export class ApiAuthController {
  constructor(private readonly apiAuthService: ApiAuthService) {}

  // @Post('register')
  // async register(@Body() registerDto: RegisterBody, @External() { ip }: TExternal) {
  //   return await this.apiAuthService.register(registerDto, ip)
  // }

  @Post('login')
  async login(
    @Body() loginDto: LoginBody,
    @External() dataExternal: TExternal
  ): Promise<BaseResponse> {
    const data = await this.apiAuthService.login(loginDto, dataExternal)
    dataExternal.oid = data.user.oid
    dataExternal.uid = data.user.id
    return { data }
  }

  @Post('login-root')
  async loginRoot(
    @Body() loginDto: LoginRootBody,
    @External() dataExternal: TExternal
  ): Promise<BaseResponse> {
    const data = await this.apiAuthService.loginRoot(loginDto, dataExternal)
    dataExternal.oid = data.user.oid
    dataExternal.uid = data.user.id
    return { data }
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
  async grantAccessToken(
    @External() dataExternal: TExternal,
    @Body() body: RefreshTokenBody
  ): Promise<BaseResponse> {
    const data = await this.apiAuthService.grantAccessToken(body.refreshToken, dataExternal)
    dataExternal.oid = data.user.oid
    dataExternal.uid = data.user.id
    return { data }
  }

  @Post('logout')
  async logout(@Body() body: LogoutBody) {
    return this.apiAuthService.logout(body)
  }
}
