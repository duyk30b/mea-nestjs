import { Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Batch,
  Customer,
  CustomerPayment,
  Distributor,
  DistributorPayment,
  Invoice,
  InvoiceExpense,
  InvoiceItem,
  InvoiceSurcharge,
  Organization,
  OrganizationSetting,
  Procedure,
  Product,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  User,
} from '../../../../_libs/database/entities'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { RootOrganizationPaginationQuery } from './request/root-organization-get.query'
import {
  RootOrganizationCreateBody,
  RootOrganizationUpdateBody,
} from './request/root-organization-upsert.body'

@Injectable()
export class ApiRootOrganizationService {
  private logger = new Logger(ApiRootOrganizationService.name)

  constructor(
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

  async clearOne(oid: number) {
    await this.manager.delete(Customer, { oid })
    await this.manager.delete(CustomerPayment, { oid })
    await this.manager.delete(Distributor, { oid })
    await this.manager.delete(DistributorPayment, { oid })
    await this.manager.delete(Invoice, { oid })
    await this.manager.delete(InvoiceExpense, { oid })
    await this.manager.delete(InvoiceItem, { oid })
    await this.manager.delete(InvoiceSurcharge, { oid })
    await this.manager.delete(OrganizationSetting, { oid })
    await this.manager.delete(Procedure, { oid })
    await this.manager.delete(Product, { oid })
    await this.manager.delete(Batch, { oid })
    await this.manager.delete(ProductMovement, { oid })
    await this.manager.delete(Receipt, { oid })
    await this.manager.delete(ReceiptItem, { oid })

    return { data: { oid } }
  }

  async deleteOne(oid: number) {
    await this.clearOne(oid)
    await this.manager.delete(Organization, { id: oid })
    await this.manager.delete(Role, { oid })
    await this.manager.delete(User, { oid })

    return { data: { oid } }
  }
}
