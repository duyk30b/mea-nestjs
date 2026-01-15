import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { LaboratorySampleRepository } from '../../../../_libs/database/repositories/laboratory-sample.repository'
import {
  LaboratorySampleCreateBody,
  LaboratorySampleGetManyQuery,
  LaboratorySamplePaginationQuery,
  LaboratorySampleUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratorySampleService {
  constructor(private readonly laboratorySampleRepository: LaboratorySampleRepository) { }

  async pagination(oid: number, query: LaboratorySamplePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: laboratorySampleList, total } = await this.laboratorySampleRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })
    return { laboratorySampleList, total, page, limit }
  }

  async getMany(oid: number, query: LaboratorySampleGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.laboratorySampleRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
      sort,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const laboratorySample = await this.laboratorySampleRepository.findOneBy({ oid, id })
    if (!laboratorySample) throw new BusinessException('error.Database.NotFound')
    return { data: { laboratorySample } }
  }

  async createOne(oid: number, body: LaboratorySampleCreateBody): Promise<BaseResponse> {
    const laboratorySample = await this.laboratorySampleRepository.insertOne({
      ...body,
      oid,
    })
    return { data: { laboratorySample } }
  }

  async updateOne(
    oid: number,
    id: number,
    body: LaboratorySampleUpdateBody
  ): Promise<BaseResponse> {
    const laboratorySampleList = await this.laboratorySampleRepository.updateMany({ id, oid }, body)
    return { data: { laboratorySample: laboratorySampleList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.laboratorySampleRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
