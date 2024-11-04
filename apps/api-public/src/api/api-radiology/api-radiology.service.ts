import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RadiologyRepository } from '../../../../_libs/database/repository/radiology/radiology.repository'
import {
  RadiologyCreateBody,
  RadiologyGetManyQuery,
  RadiologyGetOneQuery,
  RadiologyPaginationQuery,
  RadiologyUpdateBody,
} from './request'

@Injectable()
export class ApiRadiologyService {
  constructor(private readonly radiologyRepository: RadiologyRepository) { }

  async pagination(oid: number, query: RadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.radiologyRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: RadiologyGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.radiologyRepository.findMany({
      relation,
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        updatedAt: filter?.updatedAt,
      },
      sort,
      limit,
    })
    return { data }
  }

  async exampleList(): Promise<BaseResponse> {
    const data = await this.radiologyRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: RadiologyGetOneQuery): Promise<BaseResponse> {
    const radiology = await this.radiologyRepository.findOne({
      relation: { radiologyGroup: query?.relation?.radiologyGroup },
      condition: { oid, id },
    })
    if (!radiology) throw new BusinessException('error.Database.NotFound')
    return { data: { radiology } }
  }

  async createOne(oid: number, body: RadiologyCreateBody): Promise<BaseResponse> {
    const radiology = await this.radiologyRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { radiology } }
  }

  async updateOne(oid: number, id: number, body: RadiologyUpdateBody): Promise<BaseResponse> {
    const [radiology] = await this.radiologyRepository.updateAndReturnEntity({ oid, id }, body)
    if (!radiology) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    return { data: { radiology } }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.radiologyRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const radiology = await this.radiologyRepository.findOneById(id)
    return { data: { radiology } }
  }
}
