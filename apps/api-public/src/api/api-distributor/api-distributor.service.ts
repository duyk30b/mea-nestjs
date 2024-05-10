import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import {
  DistributorCreateBody,
  DistributorGetManyQuery,
  DistributorPaginationQuery,
  DistributorUpdateBody,
} from './request'

@Injectable()
export class ApiDistributorService {
  constructor(private readonly distributorRepository: DistributorRepository) {}

  async pagination(oid: number, query: DistributorPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.distributorRepository.pagination({
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

  async getMany(oid: number, query: DistributorGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.distributorRepository.findMany({
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
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.distributorRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Distributor.NotExist')
    return { data }
  }

  async createOne(oid: number, body: DistributorCreateBody): Promise<BaseResponse> {
    const id = await this.distributorRepository.insertOne({ oid, ...body })
    const data = await this.distributorRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: DistributorUpdateBody): Promise<BaseResponse> {
    const affected = await this.distributorRepository.update({ id, oid }, body)
    const data = await this.distributorRepository.findOneBy({ oid, id })
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.distributorRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.distributorRepository.findOneById(id)
    return { data }
  }
}
