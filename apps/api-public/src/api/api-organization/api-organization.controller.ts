import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { IsUser } from '../../guards/user.guard.'
import { ApiOrganizationService } from './api-organization.service'
import {
  OrganizationSettingUpdateBody,
  OrganizationSettingUpdateParams,
} from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@ApiTags('Organization')
@ApiBearerAuth('access-token')
@Controller('organization')
export class ApiOrganizationController {
  constructor(private readonly apiOrganizationService: ApiOrganizationService) {}

  @Get('/info')
  @IsUser()
  async info(@External() { oid }: TExternal) {
    return await this.apiOrganizationService.getInfo(oid)
  }

  @Patch('update-info')
  @HasPermission(PermissionId.ORGANIZATION_UPDATE_INFO)
  async updateInfo(@External() { oid }: TExternal, @Body() body: OrganizationUpdateBody) {
    return await this.apiOrganizationService.updateInfo(oid, body)
  }

  @Post('settings/upsert/:type')
  @HasPermission(PermissionId.ORGANIZATION_SETTING_SCREEN)
  async upsertSetting(
    @External() { oid }: TExternal,
    @Param() { type }: OrganizationSettingUpdateParams,
    @Body() body: OrganizationSettingUpdateBody
  ) {
    await this.apiOrganizationService.upsertSetting(oid, type, body)
    return { success: true }
  }
}
