import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiOrganizationService } from './api-organization.service'
import { OrganizationSettingUpdateBody, OrganizationSettingUpdateParams } from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@ApiTags('Organization')
@ApiBearerAuth('access-token')
// @Roles(ERole.Root)
@Controller('organization')
export class ApiOrganizationController {
	constructor(private readonly apiOrganizationService: ApiOrganizationService) { }

	@Get('detail')
	async detail(@External() { oid }: TExternal) {
		return await this.apiOrganizationService.findOne(+oid)
	}

	@Patch('update')
	async update(@External() { oid }: TExternal, @Body() body: OrganizationUpdateBody) {
		return await this.apiOrganizationService.updateOne(oid, body)
	}

	@Get('settings/get')
	async getSettings(@External() { oid }: TExternal) {
		return await this.apiOrganizationService.getAllSettings(oid)
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
