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
  CustomerSource,
  Distributor,
  DistributorPayment,
  Image,
  Laboratory,
  LaboratoryGroup,
  LaboratoryKit,
  Organization,
  PrescriptionSample,
  PrintHtml,
  Procedure,
  ProcedureGroup,
  Product,
  ProductGroup,
  ProductMovement,
  Radiology,
  RadiologyGroup,
  Receipt,
  ReceiptItem,
  Role,
  Setting,
  Ticket,
  TicketAttribute,
  TicketExpense,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
  TicketUser,
  User,
  Warehouse,
} from '../../../../_libs/database/entities'
import UserRole from '../../../../_libs/database/entities/user-role.entity'
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
    const { tableNameList } = body
    if (tableNameList.includes(Appointment.name)) {
      await this.manager.delete(Appointment, { oid })
    }
    if (tableNameList.includes(Batch.name)) {
      await this.manager.delete(Batch, { oid })
    }
    if (tableNameList.includes(BatchMovement.name)) {
      await this.manager.delete(BatchMovement, { oid })
    }

    if (tableNameList.includes(Customer.name)) {
      await this.manager.delete(Customer, { oid })
    } else {
      await this.manager.update(Customer, { oid }, { debt: 0 })
    }

    if (tableNameList.includes(CustomerPayment.name)) {
      await this.manager.delete(CustomerPayment, { oid })
    }

    if (tableNameList.includes(CustomerSource.name)) {
      await this.manager.delete(CustomerSource, { oid })
    }

    if (tableNameList.includes(Distributor.name)) {
      await this.manager.delete(Distributor, { oid })
    } else {
      await this.manager.update(Distributor, { oid }, { debt: 0 })
    }

    if (tableNameList.includes(DistributorPayment.name)) {
      await this.manager.delete(DistributorPayment, { oid })
    }

    if (tableNameList.includes(Image.name)) {
      await this.manager.delete(Image, { oid })
    } else {
      await this.manager.update(Image, { oid }, { waitDelete: 1 })
    }

    if (tableNameList.includes(Laboratory.name)) {
      await this.manager.delete(Laboratory, { oid })
    }

    if (tableNameList.includes(LaboratoryGroup.name)) {
      await this.manager.delete(LaboratoryGroup, { oid })
    }

    if (tableNameList.includes(LaboratoryKit.name)) {
      await this.manager.delete(LaboratoryKit, { oid })
    }

    if (tableNameList.includes(PrescriptionSample.name)) {
      await this.manager.delete(PrescriptionSample, { oid })
    }

    if (tableNameList.includes(PrintHtml.name)) {
      await this.manager.delete(PrintHtml, { oid })
    }

    if (tableNameList.includes(Procedure.name)) {
      await this.manager.delete(Procedure, { oid })
    }

    if (tableNameList.includes(ProcedureGroup.name)) {
      await this.manager.delete(ProcedureGroup, { oid })
    }

    if (tableNameList.includes(Product.name)) {
      await this.manager.delete(Product, { oid })
    } else {
      await this.manager.update(Product, { oid }, { quantity: 0 })
    }

    if (tableNameList.includes(ProductGroup.name)) {
      await this.manager.delete(ProductGroup, { oid })
    }

    if (tableNameList.includes(ProductMovement.name)) {
      await this.manager.delete(ProductMovement, { oid })
    }

    if (tableNameList.includes(Radiology.name)) {
      await this.manager.delete(Radiology, { oid })
    }

    if (tableNameList.includes(RadiologyGroup.name)) {
      await this.manager.delete(RadiologyGroup, { oid })
    }

    if (tableNameList.includes(Receipt.name)) {
      await this.manager.delete(Receipt, { oid })
    }

    if (tableNameList.includes(ReceiptItem.name)) {
      await this.manager.delete(ReceiptItem, { oid })
    }

    if (tableNameList.includes(Role.name)) {
      await this.manager.delete(Role, { oid })
    }

    if (tableNameList.includes(Setting.name)) {
      await this.manager.delete(Setting, { oid })
    }

    if (tableNameList.includes(TicketAttribute.name)) {
      await this.manager.delete(TicketAttribute, { oid })
    }

    if (tableNameList.includes(TicketExpense.name)) {
      await this.manager.delete(TicketExpense, { oid })
    }

    if (tableNameList.includes(TicketLaboratory.name)) {
      await this.manager.delete(TicketLaboratory, { oid })
    }

    if (tableNameList.includes(TicketProcedure.name)) {
      await this.manager.delete(TicketProcedure, { oid })
    }
    if (tableNameList.includes(TicketProduct.name)) {
      await this.manager.delete(TicketProduct, { oid })
    }
    if (tableNameList.includes(TicketRadiology.name)) {
      await this.manager.delete(TicketRadiology, { oid })
    }
    if (tableNameList.includes(TicketSurcharge.name)) {
      await this.manager.delete(TicketSurcharge, { oid })
    }
    if (tableNameList.includes(TicketUser.name)) {
      await this.manager.delete(TicketUser, { oid })
    }
    if (tableNameList.includes(Ticket.name)) {
      await this.manager.delete(Ticket, { oid })
    }
    if (tableNameList.includes(User.name)) {
      await this.manager.delete(User, { oid })
    }
    if (tableNameList.includes(UserRole.name)) {
      await this.manager.delete(UserRole, { oid })
    }
    if (tableNameList.includes(Warehouse.name)) {
      await this.manager.delete(Warehouse, { oid })
    }

    if (tableNameList.includes(Organization.name)) {
      await this.manager.delete(Organization, { id: oid })
    } else {
      const organizationRoot = await this.organizationRepository.findOneById(oid)
      await this.organizationRepository.updateAndReturnEntity(
        { id: oid },
        { dataVersion: organizationRoot.dataVersion + 1 }
      )
    }

    this.cacheDataService.clearOrganization(oid)
    return { data: { oid } }
  }
}
