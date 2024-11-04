import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RadiologyGroupRepository } from '../../../../_libs/database/repository/radiology-group/radiology-group.repository'
import {
  RadiologyGroupCreateBody,
  RadiologyGroupGetManyQuery,
  RadiologyGroupPaginationQuery,
  RadiologyGroupUpdateBody,
} from './request'

@Injectable()
export class ApiRadiologyGroupService {
  constructor(private readonly radiologyGroupRepository: RadiologyGroupRepository) { }

  async pagination(oid: number, query: RadiologyGroupPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.radiologyGroupRepository.pagination({
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

  async getMany(oid: number, query: RadiologyGroupGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.radiologyGroupRepository.findMany({
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
    const data = await this.radiologyGroupRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async createOne(oid: number, body: RadiologyGroupCreateBody): Promise<BaseResponse> {
    const id = await this.radiologyGroupRepository.insertOne({ oid, ...body })
    const data = await this.radiologyGroupRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: RadiologyGroupUpdateBody): Promise<BaseResponse> {
    const affected = await this.radiologyGroupRepository.update({ id, oid }, body)
    const data = await this.radiologyGroupRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.radiologyGroupRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
