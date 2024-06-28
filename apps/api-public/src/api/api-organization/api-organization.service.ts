import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { CacheDataService } from '../../../../_libs/transporter/cache-manager/cache-data.service'
import { OrganizationUpdateBody } from './request/organization-update.body'

@Injectable()
export class ApiOrganizationService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async getInfo(oid: number): Promise<BaseResponse> {
    const organization = await this.organizationRepository.findOneById(oid)
    this.cacheDataService.updateOrganization(organization)
    return { data: organization }
  }

  async updateInfo(id: number, body: OrganizationUpdateBody): Promise<BaseResponse> {
    const [organization] = await this.organizationRepository.updateAndReturnEntity({ id }, body)
    this.cacheDataService.updateOrganization(organization)
    return { data: organization }
  }
}
