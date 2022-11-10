import { Injectable } from '@nestjs/common'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { OrganizationRepository } from '_libs/database/repository'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { OrganizationSettingUpdateBody } from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@Injectable()
export class ApiOrganizationService {
	constructor(private organizationRepository: OrganizationRepository) { }

	async findOne(id: number) {
		return await this.organizationRepository.findOne(id)
	}

	async updateOne(id: number, body: OrganizationUpdateBody) {
		const { affected } = await this.organizationRepository.update(id, body)
		if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)
		return await this.organizationRepository.findOne(id)
	}

	async getAllSettings(oid: number) {
		return await this.organizationRepository.getAllSetting(oid)
	}

	async upsertSetting(oid: number, type: OrganizationSettingType, body: OrganizationSettingUpdateBody) {
		return await this.organizationRepository.upsertSetting(oid, type, body.data)
	}
}
