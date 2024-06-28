import { Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Batch,
  BatchMovement,
  Customer,
  CustomerPayment,
  Distributor,
  DistributorPayment,
  Image,
  Invoice,
  InvoiceExpense,
  InvoiceItem,
  InvoiceSurcharge,
  Organization,
  Procedure,
  Product,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  Setting,
  User,
  Visit,
  VisitBatch,
  VisitDiagnosis,
  VisitProcedure,
  VisitProduct,
} from '../../../../_libs/database/entities'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { CacheDataService } from '../../../../_libs/transporter/cache-manager/cache-data.service'
import { RootOrganizationPaginationQuery } from './request/root-organization-get.query'
import {
  RootOrganizationCreateBody,
  RootOrganizationUpdateBody,
} from './request/root-organization-upsert.body'

@Injectable()
export class ApiRootOrganizationService {
  private logger = new Logger(ApiRootOrganizationService.name)

  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository,
    @InjectEntityManager() private manager: EntityManager
  ) {}

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

  async createOne(body: RootOrganizationCreateBody): Promise<BaseResponse<Organization>> {
    const id = await this.organizationRepository.insertOneFullField(body)
    const data: Organization = await this.organizationRepository.findOneById(id)
    this.cacheDataService.updateOrganization(data)
    return { data }
  }

  async updateOne(oid: number, body: RootOrganizationUpdateBody) {
    await this.organizationRepository.update({ id: oid }, body)
    const data = await this.organizationRepository.findOneById(oid)
    this.cacheDataService.updateOrganization(data)
    return { data }
  }

  async clearOne(oid: number) {
    await this.manager.delete(Batch, { oid })
    await this.manager.delete(BatchMovement, { oid })
    await this.manager.delete(Customer, { oid })
    await this.manager.delete(CustomerPayment, { oid })
    await this.manager.delete(Distributor, { oid })
    await this.manager.delete(DistributorPayment, { oid })
    await this.manager.delete(Invoice, { oid })
    await this.manager.delete(InvoiceExpense, { oid })
    await this.manager.delete(InvoiceItem, { oid })
    await this.manager.delete(InvoiceSurcharge, { oid })
    await this.manager.delete(Procedure, { oid })
    await this.manager.delete(Product, { oid })
    await this.manager.delete(ProductMovement, { oid })
    await this.manager.delete(Receipt, { oid })
    await this.manager.delete(ReceiptItem, { oid })
    await this.manager.delete(Setting, { oid })
    await this.manager.delete(Visit, { oid })
    await this.manager.delete(VisitBatch, { oid })
    await this.manager.delete(VisitDiagnosis, { oid })
    await this.manager.delete(VisitProcedure, { oid })
    await this.manager.delete(VisitProduct, { oid })

    return { data: { oid } }
  }

  async deleteOne(oid: number) {
    await this.clearOne(oid)
    await this.manager.delete(Organization, { id: oid })
    await this.manager.delete(Role, { oid })
    await this.manager.delete(User, { oid })

    this.cacheDataService.removeOrganization(oid)
    return { data: { oid } }
  }
}
