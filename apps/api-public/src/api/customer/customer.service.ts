import { CacheDataService } from '@libs/common/cache-data/cache-data.service'
import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import { BusinessError } from '@libs/database/common/error'
import { Customer, CustomerGroup, CustomerSource } from '@libs/database/entities'
import { PaymentPersonType } from '@libs/database/entities/payment.entity'
import {
  CustomerGroupRepository,
  CustomerSourceRepository,
  PaymentRepository,
  PaymentTicketRepository,
  TicketRepository,
} from '@libs/database/repositories'
import { CustomerRepository } from '@libs/database/repositories/customer.repository'
import { OrganizationRepository } from '@libs/database/repositories/organization.repository'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerCreateBody,
  CustomerGetManyQuery,
  CustomerGetOneQuery,
  CustomerPaginationQuery,
  CustomerRelationQuery,
  CustomerUpdateBody,
} from './request'

@Injectable()
export class CustomerService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly customerRepository: CustomerRepository,
    private readonly customerGroupRepository: CustomerGroupRepository,
    private readonly customerSourceRepository: CustomerSourceRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketRepository: PaymentTicketRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly ticketRepository: TicketRepository
  ) {}

  async pagination(oid: number, query: CustomerPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: customerList, total } = await this.customerRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        debt: filter?.debt,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, customerList, relation: query.relation })
    }
    return { customerList, total, page, limit }
  }

  async getMany(oid: number, query: CustomerGetManyQuery) {
    const { limit, filter, sort } = query

    const customerList = await this.customerRepository.findMany({
      condition: {
        oid,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        updatedAt: filter?.updatedAt,
      },
      limit,
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, customerList, relation: query.relation })
    }
    return { customerList }
  }

  async getOne(oid: number, id: number, query?: CustomerGetOneQuery) {
    const customer = await this.customerRepository.findOneBy({ oid, id })
    if (!customer) throw new BusinessException('error.Database.NotFound')
    return { customer }
  }

  async createOne(oid: number, body: CustomerCreateBody) {
    let customerCode = body.customerCode
    if (!customerCode) {
      const count = await this.customerRepository.getMaxId()
      customerCode = (count + 1).toString()
    }

    const existCustomer = await this.customerRepository.findOneBy({
      oid,
      customerCode,
    })
    if (existCustomer) {
      throw new BusinessError(`Trùng mã khách hàng với ${existCustomer.fullName}`)
    }

    const customer = await this.customerRepository.insertOne({
      ...body,
      oid,
      customerCode,
      debt: 0,
      isHasTicket: 0,
    })
    this.socketEmitService.customerUpsert(oid, { customer })
    return { customer }
  }

  async updateOne(oid: number, customerId: number, customerBody: CustomerUpdateBody) {
    if (customerBody.customerCode != null) {
      const existCustomer = await this.customerRepository.findOneBy({
        oid,
        customerCode: customerBody.customerCode,
        id: { NOT: customerId },
      })
      if (existCustomer) {
        throw new BusinessError(`Trùng mã khách hàng với ${existCustomer.fullName}`)
      }
    }

    const customer = await this.customerRepository.updateOne({ oid, id: customerId }, customerBody)
    this.socketEmitService.customerUpsert(oid, { customer })
    return { customer }
  }

  async destroyOne(options: { oid: number; customerId: number }) {
    const { oid, customerId } = options
    const ticketList = await this.ticketRepository.findMany({
      condition: { oid, customerId },
      limit: 10,
    })

    if (ticketList.length === 0) {
      const [customerDestroy, paymentDestroyedList] = await Promise.all([
        this.customerRepository.deleteMany({ oid, id: customerId }),
        this.paymentRepository.deleteMany({
          oid,
          personId: customerId,
          personType: PaymentPersonType.Customer,
        }),
      ])

      if (paymentDestroyedList.length) {
        await this.paymentTicketRepository.deleteBasic({
          oid,
          paymentId: { IN: paymentDestroyedList.map((i) => i.id) },
        })
      }

      await this.organizationRepository.updateDataVersion(oid, {
        product: false,
        batch: false,
        customer: true,
      })
      this.cacheDataService.clearOrganization(oid)
    }

    return { ticketList, customerId, success: ticketList.length === 0 }
  }

  async generateRelation(options: {
    oid: number
    customerList: Customer[]
    relation: CustomerRelationQuery
  }) {
    const { oid, customerList, relation } = options
    const customerIdList = ESArray.uniqueArray(customerList.map((i) => i.id))
    const customerGroupIdList = ESArray.uniqueArray(customerList.map((i) => i.customerGroupId))
    const customerSourceIdList = ESArray.uniqueArray(customerList.map((i) => i.customerSourceId))

    const [customerGroupList, customerSourceList] = await Promise.all([
      relation?.customerGroup && customerGroupIdList.length
        ? this.customerGroupRepository.findManyBy({
            oid,
            id: { IN: customerGroupIdList },
          })
        : <CustomerGroup[]>[],
      relation?.customerSource && customerSourceIdList.length
        ? this.customerSourceRepository.findManyBy({
            oid,
            id: { IN: customerSourceIdList },
          })
        : <CustomerSource[]>[],
    ])

    const customerGroupMap = ESArray.arrayToKeyValue(customerGroupList, 'id')
    const customerSourceMap = ESArray.arrayToKeyValue(customerSourceList, 'id')

    customerList.forEach((customer: Customer) => {
      if (relation?.customerGroup) {
        customer.customerGroup = customerGroupMap[customer.customerGroupId]
      }
      if (relation?.customerSource) {
        customer.customerSource = customerSourceMap[customer.customerSourceId]
      }
    })

    return customerList
  }
}
