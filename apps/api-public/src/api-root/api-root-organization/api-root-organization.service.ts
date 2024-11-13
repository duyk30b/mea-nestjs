import { Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Appointment,
  Batch,
  BatchMovement,
  Customer,
  CustomerPayment,
  Distributor,
  DistributorPayment,
  Image,
  Organization,
  Product,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  Ticket,
  TicketDiagnosis,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
  TicketUser,
  User,
} from '../../../../_libs/database/entities'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { RootOrganizationPaginationQuery } from './request/root-organization-get.query'
import {
  RootOrganizationCreateBody,
  RootOrganizationUpdateBody,
} from './request/root-organization-upsert.body'

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

  async clearOne(oid: number) {
    await this.manager.delete(Appointment, { oid })
    await this.manager.delete(BatchMovement, { oid })
    await this.manager.delete(Batch, { oid })
    await this.manager.delete(CustomerPayment, { oid })
    // await this.manager.delete(CustomerSource, { oid })
    await this.manager.update(Customer, { oid }, { debt: 0 })
    await this.manager.delete(DistributorPayment, { oid })
    await this.manager.update(Distributor, { oid }, { debt: 0 })
    await this.manager.update(Image, { oid }, { waitDelete: 1 }) // TODO
    // await this.manager.delete(ProcedureGroup, { oid })
    // await this.manager.delete(Procedure, { oid })
    // await this.manager.delete(ProductGroup, { oid })
    await this.manager.delete(ProductMovement, { oid })
    await this.manager.update(Product, { oid }, { quantity: 0, costAmount: 0 })
    // await this.manager.delete(RadiologyGroup, { oid })
    // await this.manager.delete(Radiology, { oid })
    await this.manager.delete(ReceiptItem, { oid })
    await this.manager.delete(Receipt, { oid })
    // await this.manager.delete(Role, { oid })

    // await this.manager.delete(Setting, { oid })
    await this.manager.delete(TicketDiagnosis, { oid })
    await this.manager.delete(TicketExpense, { oid })
    await this.manager.delete(TicketSurcharge, { oid })
    await this.manager.delete(TicketProduct, { oid })
    await this.manager.delete(TicketProcedure, { oid })
    await this.manager.delete(TicketRadiology, { oid })
    await this.manager.delete(TicketUser, { oid })
    await this.manager.delete(Ticket, { oid })

    // await this.manager.delete(User, { oid })
    // await this.manager.delete(UserRole, { oid })

    const organizationRoot = await this.organizationRepository.findOneById(oid)
    const [organization] = await this.organizationRepository.updateAndReturnEntity(
      { id: oid },
      { dataVersion: organizationRoot.dataVersion + 1 }
    )
    if (!organization) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.cacheDataService.clearOrganization(organization.id)
    this.socketEmitService.organizationUpdate(organization.id, { organization })
    return { data: { oid } }
  }

  async deleteOne(oid: number) {
    await this.clearOne(oid)
    await this.manager.delete(Organization, { id: oid })
    await this.manager.delete(Role, { oid })
    await this.manager.delete(User, { oid })

    this.cacheDataService.clearOrganization(oid)
    return { data: { oid } }
  }
}
