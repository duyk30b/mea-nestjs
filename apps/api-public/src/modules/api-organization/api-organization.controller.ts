import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
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
	async detail(@OrganizationId() oid: number) {
		return await this.apiOrganizationService.findOne(+oid)
	}

	@Patch('update')
	async update(@OrganizationId() oid: number, @Body() body: OrganizationUpdateBody) {
		return await this.apiOrganizationService.updateOne(oid, body)
	}

	@Get('settings/get')
	async getSettings(@OrganizationId() oid: number) {
		return await this.apiOrganizationService.getAllSettings(oid)
	}

	@Post('settings/upsert/:type')
	async upsertSetting(
		@OrganizationId() oid: number,
		@Param() { type }: OrganizationSettingUpdateParams,
		@Body() body: OrganizationSettingUpdateBody
	) {
		await this.apiOrganizationService.upsertSetting(oid, type, body)
		return { success: true }
	}
}
