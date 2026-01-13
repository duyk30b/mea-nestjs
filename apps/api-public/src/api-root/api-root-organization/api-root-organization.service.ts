import { Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { ESArray } from '../../../../_libs/common/helpers'
import * as AllEntity from '../../../../_libs/database/entities'
import {
  Customer,
  Distributor,
  Image,
  Organization,
  Product,
} from '../../../../_libs/database/entities'
import {
  ImageRepository,
  OrganizationPaymentRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { OrganizationRelationQuery } from '../../api/api-organization/request'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  RootOrganizationClearBody,
  RootOrganizationCreateBody,
  RootOrganizationPaginationQuery,
  RootOrganizationPaymentMoneyBody,
  RootOrganizationUpdateBody,
} from './request'

@Injectable()
export class ApiRootOrganizationService {
  private logger = new Logger(ApiRootOrganizationService.name)

  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly userRepository: UserRepository,
    private readonly organizationPaymentRepository: OrganizationPaymentRepository,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async pagination(query: RootOrganizationPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: organizationList, total } = await this.organizationRepository.pagination({
      page,
      limit,
      condition: {},
      sort,
    })
    if (query.relation) {
      await this.generateRelation({ organizationList, relation: query.relation })
    }
    return {
      organizationList,
      page,
      limit,
      total,
    }
  }

  async createOne(body: RootOrganizationCreateBody) {
    const organizationCreated = await this.organizationRepository.insertOne({
      ...body,
      emailVerify: 0,
      logoImageId: 0,
    })
    this.cacheDataService.updateOrganizationInfo(organizationCreated)
    return { organizationCreated }
  }

  async updateOne(oid: number, body: RootOrganizationUpdateBody) {
    const organizationRoot = await this.organizationRepository.findOneById(oid)
    const organizationModified = await this.organizationRepository.updateOne(
      { id: oid },
      {
        ...body,
        emailVerify: organizationRoot.email === body.email ? organizationRoot.emailVerify : 0,
      }
    )

    this.cacheDataService.updateOrganizationInfo(organizationModified)
    return { organizationModified }
  }

  async paymentMoney(oid: number, body: RootOrganizationPaymentMoneyBody) {
    const organizationPaymentCreated = await this.organizationPaymentRepository.insertOne({
      oid,
      money: body.money,
      createdAt: body.createdAt,
      expiryAt: body.expiryAt,
      note: body.note,
    })
    const organizationModified = await this.organizationRepository.updateOne(
      { id: oid },
      { expiryDate: body.expiryAt }
    )

    this.cacheDataService.updateOrganizationInfo(organizationModified)
    return { organizationModified }
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
      await this.organizationRepository.updateDataVersion(oid, {
        product: true,
        batch: true,
        customer: true,
      })
    }
    this.cacheDataService.clearOrganization(oid)
    return { oid }
  }

  async generateRelation(props: {
    organizationList: Organization[]
    relation?: OrganizationRelationQuery
  }) {
    const { organizationList, relation } = props

    const organizationIdList = ESArray.uniqueArray(organizationList.map((i) => i.id))
    const logoImageIdList = ESArray.uniqueArray(organizationList.map((i) => i.logoImageId))

    const [logoImageList, userList, organizationPaymentList] = await Promise.all([
      relation?.logoImage
        ? this.imageRepository.findManyBy({
          oid: { IN: organizationIdList },
          id: { IN: logoImageIdList },
        })
        : <AllEntity.Image[]>[],
      relation?.userList
        ? this.userRepository.findManyBy({ oid: { IN: organizationIdList } })
        : <AllEntity.User[]>[],
      relation?.organizationPaymentList
        ? this.organizationPaymentRepository.findManyBy({
          oid: { IN: organizationIdList },
        })
        : <AllEntity.OrganizationPayment[]>[],
    ])

    const logoImageMap = ESArray.arrayToKeyValue(logoImageList, 'id')

    organizationList.forEach((org: Organization) => {
      if (relation.logoImage) {
        org.logoImage = logoImageMap[org.logoImageId]
      }
      if (relation.userList) {
        org.userList = userList.filter((user) => {
          return user.oid === org.id
        })
      }
      if (relation.organizationPaymentList) {
        org.organizationPaymentList = organizationPaymentList.filter((orgPayment) => {
          return orgPayment.oid === org.id
        })
      }
    })

    return organizationList
  }
}
