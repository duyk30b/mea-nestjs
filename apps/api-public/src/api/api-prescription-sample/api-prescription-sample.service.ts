import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { PrescriptionSampleRepository } from '../../../../_libs/database/repository/prescription-sample/prescription-sample.repository'
import {
  PrescriptionSampleCreateBody,
  PrescriptionSampleGetManyQuery,
  PrescriptionSamplePaginationQuery,
  PrescriptionSampleUpdateBody,
} from './request'

@Injectable()
export class ApiPrescriptionSampleService {
  constructor(private readonly prescriptionSampleRepository: PrescriptionSampleRepository) { }

  async pagination(oid: number, query: PrescriptionSamplePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.prescriptionSampleRepository.pagination({
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

  async getMany(oid: number, query: PrescriptionSampleGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.prescriptionSampleRepository.findMany({
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
    const prescriptionSample = await this.prescriptionSampleRepository.findOneBy({ oid, id })
    if (!prescriptionSample) throw new BusinessException('error.Database.NotFound')
    return { data: { prescriptionSample } }
  }

  async createOne(oid: number, body: PrescriptionSampleCreateBody): Promise<BaseResponse> {
    const prescriptionSample =
      await this.prescriptionSampleRepository.insertOneFullFieldAndReturnEntity({
        ...body,
        oid,
      })
    return { data: { prescriptionSample } }
  }

  async updateOne(
    oid: number,
    id: number,
    body: PrescriptionSampleUpdateBody
  ): Promise<BaseResponse> {
    const prescriptionSampleList = await this.prescriptionSampleRepository.updateAndReturnEntity(
      { id, oid },
      body
    )
    return { data: { prescriptionSample: prescriptionSampleList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.prescriptionSampleRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
