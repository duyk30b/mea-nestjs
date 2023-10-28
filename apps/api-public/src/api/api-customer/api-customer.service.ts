import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import {
  CustomerCreateBody,
  CustomerGetManyQuery,
  CustomerGetOneQuery,
  CustomerPaginationQuery,
  CustomerUpdateBody,
} from './request'

@Injectable()
export class ApiCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

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
      sort: sort || { id: 'DESC' },
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
    const data = await this.customerRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Customer.NotExist')
    return { data }
  }

  async createOne(oid: number, body: CustomerCreateBody): Promise<BaseResponse> {
    const id = await this.customerRepository.insertOne({ oid, ...body })
    const data = await this.customerRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: CustomerUpdateBody): Promise<BaseResponse> {
    const affected = await this.customerRepository.update({ oid, id }, body)
    const data = await this.customerRepository.findOneBy({ oid, id })
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.customerRepository.update(
      { oid, id, debt: 0 },
      { deletedAt: Date.now() }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.customerRepository.findOneById(id)
    return { data }
  }
}
