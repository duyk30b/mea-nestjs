import { Injectable, Logger } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ScreenSettingKey } from '../../../../_libs/database/entities/organization-setting.entity'
import { OrganizationSettingRepository } from '../../../../_libs/database/repository/organization-setting/organization-setting.repository'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { OrganizationSettingUpdateBody } from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@Injectable()
export class ApiOrganizationService {
  private logger = new Logger(ApiOrganizationService.name)

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationSettingRepository: OrganizationSettingRepository
  ) {}

  async getInfo(oid: number): Promise<BaseResponse> {
    const data = await this.organizationRepository.findOneById(oid)
    return { data }
  }

  async updateInfo(id: number, body: OrganizationUpdateBody): Promise<BaseResponse> {
    await this.organizationRepository.update({ id }, body)
    const data = await this.organizationRepository.findOneById(id)
    return { data }
  }

  async upsertSetting(
    oid: number,
    type: ScreenSettingKey,
    body: OrganizationSettingUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.organizationSettingRepository.upsertSetting(oid, type, body.data)
    return { data }
  }
}
