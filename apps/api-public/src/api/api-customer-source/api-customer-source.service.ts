import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CustomerSourceRepository } from '../../../../_libs/database/repositories/customer-source.repository'
import {
  CustomerSourceCreateBody,
  CustomerSourceGetManyQuery,
  CustomerSourcePaginationQuery,
  CustomerSourceUpdateBody,
} from './request'

@Injectable()
export class ApiCustomerSourceService {
  constructor(private readonly customerSourceRepository: CustomerSourceRepository) { }

  async pagination(oid: number, query: CustomerSourcePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.customerSourceRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: CustomerSourceGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.customerSourceRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.customerSourceRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async createOne(oid: number, body: CustomerSourceCreateBody): Promise<BaseResponse> {
    const id = await this.customerSourceRepository.insertOne({ oid, ...body })
    const data = await this.customerSourceRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: CustomerSourceUpdateBody): Promise<BaseResponse> {
    const affected = await this.customerSourceRepository.updateBasic({ id, oid }, body)
    const data = await this.customerSourceRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.customerSourceRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.customerSourceRepository.findOneById(id)
    return { data }
  }
}
