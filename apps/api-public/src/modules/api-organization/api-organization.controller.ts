import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiOrganizationService } from './api-organization.service'
import { OrganizationSettingUpdateBody, OrganizationSettingUpdateParams } from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@ApiTags('Organization')
@ApiBearerAuth('access-token')
// @Roles(ERole.Root)
@Controller('organization')
export class ApiOrganizationController {
    constructor(private readonly apiOrganizationService: ApiOrganizationService) {}

    @Get('info')
    async info(@External() { oid }: TExternal) {
        return await this.apiOrganizationService.info(+oid)
    }

    @Patch('update')
    async update(@External() { oid }: TExternal, @Body() body: OrganizationUpdateBody) {
        return await this.apiOrganizationService.updateOne(oid, body)
    }

    @Post('settings/upsert/:type')
    async upsertSetting(
        @External() { oid }: TExternal,
        @Param() { type }: OrganizationSettingUpdateParams,
        @Body() body: OrganizationSettingUpdateBody
    ) {
        await this.apiOrganizationService.upsertSetting(oid, type, body)
        return { success: true }
    }
}
