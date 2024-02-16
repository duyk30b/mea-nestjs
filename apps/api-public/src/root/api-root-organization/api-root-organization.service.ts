import { Injectable, Logger } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Organization } from '../../../../_libs/database/entities'
import { OrganizationRepository } from '../../../../_libs/database/repository'
import { RootOrganizationPaginationQuery } from './request/root-organization-get.query'
import {
  RootOrganizationCreateBody,
  RootOrganizationUpdateBody,
} from './request/root-organization-upsert.body'

@Injectable()
export class ApiRootOrganizationService {
  private logger = new Logger(ApiRootOrganizationService.name)

  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async pagination(query: RootOrganizationPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.organizationRepository.pagination({
      page,
      limit,
      relation,
      condition: {},
      sort: sort || { id: 'DESC' },
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async createOne(body: RootOrganizationCreateBody): Promise<BaseResponse<Organization>> {
    const id = await this.organizationRepository.insertOneFullField(body)
    const data: Organization = await this.organizationRepository.findOneById(id)
    return { data }
  }

  async updateOne(id: number, body: RootOrganizationUpdateBody) {
    await this.organizationRepository.update({ id }, body)
    const data = await this.organizationRepository.findOneById(id)
    return { data }
  }
}
