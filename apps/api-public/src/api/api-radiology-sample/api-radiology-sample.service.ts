import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RadiologySampleInsertType } from '../../../../_libs/database/entities/radiology-sample.entity'
import { RadiologySampleRepository } from '../../../../_libs/database/repositories/radiology-sample.repository'
import {
  RadiologySampleCreateBody,
  RadiologySampleGetManyQuery,
  RadiologySamplePaginationQuery,
  RadiologySampleUpdateBody,
} from './request'

@Injectable()
export class ApiRadiologySampleService {
  constructor(private readonly radiologySampleRepository: RadiologySampleRepository) { }

  async pagination(oid: number, query: RadiologySamplePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.radiologySampleRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        userId: filter?.userId,
        radiologyId: filter?.radiologyId,
      },
      sort,
    })
    return {
      data: {
        radiologySampleList: data,
        total,
        page,
        limit,
      },
    }
  }

  async getMany(oid: number, query: RadiologySampleGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const radiologySampleList = await this.radiologySampleRepository.findMany({
      relation,
      condition: {
        oid,
        userId: filter?.userId,
        radiologyId: filter?.radiologyId,
      },
      limit,
      sort,
    })
    return { data: { radiologySampleList } }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const radiologySample = await this.radiologySampleRepository.findOneBy({
      oid,
      id,
    })
    if (!radiologySample) throw new BusinessException('error.Database.NotFound')
    return { data: { radiologySample } }
  }

  async createOne(oid: number, body: RadiologySampleCreateBody): Promise<BaseResponse> {
    const rcsInsert: RadiologySampleInsertType = {
      oid,
      ...body,
    }
    const radiologySample = await this.radiologySampleRepository.insertOneAndReturnEntity(rcsInsert)
    return { data: { radiologySample } }
  }

  async updateOne(oid: number, id: number, body: RadiologySampleUpdateBody): Promise<BaseResponse> {
    const radiologySample = await this.radiologySampleRepository.updateOneAndReturnEntity(
      { id, oid },
      body
    )
    return { data: { radiologySample } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const radiologySampleDestroyed = await this.radiologySampleRepository.deleteOneAndReturnEntity({
      oid,
      id,
    })

    return { data: { radiologySampleDestroyed } }
  }
}
