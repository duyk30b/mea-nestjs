import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { LaboratoryKitRepository } from '../../../../_libs/database/repositories/laboratory-kit.repository'
import {
  LaboratoryKitCreateBody,
  LaboratoryKitGetManyQuery,
  LaboratoryKitPaginationQuery,
  LaboratoryKitUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratoryKitService {
  constructor(private readonly laboratoryKitRepository: LaboratoryKitRepository) { }

  async pagination(oid: number, query: LaboratoryKitPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.laboratoryKitRepository.pagination({
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

  async getMany(oid: number, query: LaboratoryKitGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.laboratoryKitRepository.findMany({
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
    const laboratoryKit = await this.laboratoryKitRepository.findOneBy({ oid, id })
    if (!laboratoryKit) throw new BusinessException('error.Database.NotFound')
    return { data: { laboratoryKit } }
  }

  async createOne(oid: number, body: LaboratoryKitCreateBody): Promise<BaseResponse> {
    const laboratoryKit = await this.laboratoryKitRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    return { data: { laboratoryKit } }
  }

  async updateOne(oid: number, id: number, body: LaboratoryKitUpdateBody): Promise<BaseResponse> {
    const laboratoryKitList = await this.laboratoryKitRepository.updateAndReturnEntity(
      { id, oid },
      body
    )
    return { data: { laboratoryKit: laboratoryKitList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.laboratoryKitRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
