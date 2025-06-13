import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BusinessError } from '../../../../_libs/database/common/error'
import { PersonType } from '../../../../_libs/database/entities/payment.entity'
import { PaymentRepository, TicketRepository } from '../../../../_libs/database/repositories'
import { CustomerRepository } from '../../../../_libs/database/repositories/customer.repository'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  CustomerCreateBody,
  CustomerGetManyQuery,
  CustomerGetOneQuery,
  CustomerPaginationQuery,
  CustomerUpdateBody,
} from './request'

@Injectable()
export class ApiCustomerService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly customerRepository: CustomerRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: CustomerPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.customerRepository.pagination({
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
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: CustomerGetManyQuery): Promise<BaseResponse> {
    const { limit, filter } = query

    const data = await this.customerRepository.findMany({
      condition: {
        oid,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query?: CustomerGetOneQuery): Promise<BaseResponse> {
    const customer = await this.customerRepository.findOneBy({ oid, id })
    if (!customer) throw new BusinessException('error.Database.NotFound')
    return { data: { customer } }
  }

  async createOne(oid: number, body: CustomerCreateBody): Promise<BaseResponse> {
    let customerCode = body.customerCode
    if (!customerCode) {
      const count = await this.customerRepository.getMaxId()
      customerCode = (count + 1).toString()
    }

    const customer = await this.customerRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      debt: 0,
      customerCode,
    })
    this.socketEmitService.customerUpsert(oid, { customer })
    return { data: { customer } }
  }

  async updateOne(
    oid: number,
    customerId: number,
    customerBody: CustomerUpdateBody
  ): Promise<BaseResponse> {
    const existCustomer = await this.customerRepository.findOneBy({
      oid,
      customerCode: customerBody.customerCode,
      id: { NOT: customerId },
    })
    if (existCustomer) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existCustomer.fullName}`)
    }

    const customer = await this.customerRepository.updateOneAndReturnEntity(
      { oid, id: customerId },
      customerBody
    )
    this.socketEmitService.customerUpsert(oid, { customer })
    return { data: { customer } }
  }

  async destroyOne(options: { oid: number; customerId: number }): Promise<BaseResponse> {
    const { oid, customerId } = options
    const ticketList = await this.ticketRepository.findMany({
      condition: { oid, customerId },
      limit: 10,
    })
    if (ticketList.length > 0) {
      return {
        data: { ticketList },
        success: false,
      }
    }

    await Promise.allSettled([
      this.customerRepository.delete({ oid, id: customerId }),
      this.paymentRepository.delete({ oid, personId: customerId, personType: PersonType.Customer }),
    ])

    await this.organizationRepository.updateDataVersion(oid)
    this.cacheDataService.clearOrganization(oid)

    return { data: { ticketList: [], customerId } }
  }
}
