import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ParaclinicalGroupRepository } from '../../../../_libs/database/repository/paraclinical-group/paraclinical-group.repository'
import {
  ParaclinicalGroupCreateBody,
  ParaclinicalGroupGetManyQuery,
  ParaclinicalGroupPaginationQuery,
  ParaclinicalGroupUpdateBody,
} from './request'

@Injectable()
export class ApiParaclinicalGroupService {
  constructor(private readonly paraclinicalGroupRepository: ParaclinicalGroupRepository) { }

  async pagination(oid: number, query: ParaclinicalGroupPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.paraclinicalGroupRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: ParaclinicalGroupGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.paraclinicalGroupRepository.findMany({
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.paraclinicalGroupRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async createOne(oid: number, body: ParaclinicalGroupCreateBody): Promise<BaseResponse> {
    const id = await this.paraclinicalGroupRepository.insertOne({ oid, ...body })
    const data = await this.paraclinicalGroupRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: ParaclinicalGroupUpdateBody): Promise<BaseResponse> {
    const affected = await this.paraclinicalGroupRepository.update({ id, oid }, body)
    const data = await this.paraclinicalGroupRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.paraclinicalGroupRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
