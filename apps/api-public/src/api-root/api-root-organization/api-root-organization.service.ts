import { All, Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import * as AllEntity from '../../../../_libs/database/entities'
import {
  Customer,
  Distributor,
  Image,
  Organization,
  Product,
} from '../../../../_libs/database/entities'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  RootOrganizationClearBody,
  RootOrganizationCreateBody,
  RootOrganizationPaginationQuery,
  RootOrganizationUpdateBody,
} from './request'

@Injectable()
export class ApiRootOrganizationService {
  private logger = new Logger(ApiRootOrganizationService.name)

  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async pagination(query: RootOrganizationPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.organizationRepository.pagination({
      page,
      limit,
      relation,
      condition: {},
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async createOne(
    body: RootOrganizationCreateBody
  ): Promise<BaseResponse<{ organization: Organization }>> {
    const organization = await this.organizationRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      emailVerify: 0,
      logoImageId: 0,
    })
    this.cacheDataService.updateOrganizationInfo(organization)
    return { data: { organization } }
  }

  async updateOne(oid: number, body: RootOrganizationUpdateBody) {
    const organizationRoot = await this.organizationRepository.findOneById(oid)
    const [organization] = await this.organizationRepository.updateAndReturnEntity(
      { id: oid },
      {
        ...body,
        emailVerify: organizationRoot.email === body.email ? organizationRoot.emailVerify : 0,
      }
    )
    if (!organization) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.cacheDataService.updateOrganizationInfo(organization)
    return { data: { organization } }
  }

  async clearOne(oid: number, body: RootOrganizationClearBody) {
    const { tableNameDeleteList, tableNameClearList } = body

    if (tableNameClearList.includes(Customer.name)) {
      await this.manager.update(Customer, { oid }, { debt: 0 })
    }
    if (tableNameClearList.includes(Distributor.name)) {
      await this.manager.update(Distributor, { oid }, { debt: 0 })
    }
    if (tableNameClearList.includes(Image.name)) {
      await this.manager.update(Image, { oid }, { waitDelete: 1 })
    }
    if (tableNameClearList.includes(Product.name)) {
      await this.manager.update(Product, { oid }, { quantity: 0 })
    }

    for (let index = 0; index < body.tableNameDeleteList.length; index++) {
      const tableName = tableNameDeleteList[index]
      if (AllEntity[tableName]) {
        if (tableName === AllEntity.Organization.name) {
          await this.manager.delete(AllEntity[tableName], { id: oid })
        } else {
          await this.manager.delete(AllEntity[tableName], { oid })
        }
      }
    }

    if (!tableNameDeleteList.includes(Organization.name)) {
      await this.organizationRepository.updateDataVersion(oid)
    }
    this.cacheDataService.clearOrganization(oid)
    return { data: { oid } }
  }
}
