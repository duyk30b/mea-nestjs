import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiSettingGoogleDriverService } from './api-setting-google-driver.service'
import { ApiSettingService } from './api-setting.service'
import { SettingUpsertBody, SettingUpsertParams } from './request/setting-upsert.request'

@ApiTags('Setting')
@ApiBearerAuth('access-token')
@Controller('setting')
export class ApiSettingController {
  constructor(
    private readonly apiSettingService: ApiSettingService,
    private readonly apiSettingGoogleDriverService: ApiSettingGoogleDriverService
  ) { }

  @Get('get-map')
  @UserPermission()
  async getMap(@External() { oid }: TExternal) {
    return await this.apiSettingService.getMap(oid)
  }

  @Post('upsert/:type')
  @UserPermission(PermissionId.ORGANIZATION_SETTING_UPSERT)
  async upsert(
    @External() { oid }: TExternal,
    @Param() { type }: SettingUpsertParams,
    @Body() body: SettingUpsertBody
  ) {
    await this.apiSettingService.upsert(oid, type, body)
    return { success: true }
  }

  @Get('google-driver/get-auth-url')
  @UserPermission(PermissionId.ORGANIZATION_SETTING_UPSERT)
  async getAuthUrl(@External() { oid }: TExternal) {
    return this.apiSettingGoogleDriverService.getAuthUrl({ state: `${oid}` })
  }

  @Post('google-driver/logout')
  @UserPermission(PermissionId.ORGANIZATION_SETTING_UPSERT)
  async authLogout(@External() { oid }: TExternal) {
    return this.apiSettingGoogleDriverService.logout(oid)
  }

  @Get('google-driver/login-callback')
  async authCallback(
    @Query() query: { code: string; scope: string; state: string },
    @Res() reply: FastifyReply
  ) {
    await this.apiSettingGoogleDriverService.loginCallback(query)
    return reply.type('text/html').send(`<script>window.close();</script>`)
  }

  @Get('google-driver/get-all-folders')
  @UserPermission()
  async getAllFolders() {
    return await this.apiSettingGoogleDriverService.getAllFolders('')
  }

  @Get('google-driver/get-all-accounts')
  @IsRoot()
  async getAllAccounts() {
    return await this.apiSettingGoogleDriverService.getAllAccounts()
  }
}
