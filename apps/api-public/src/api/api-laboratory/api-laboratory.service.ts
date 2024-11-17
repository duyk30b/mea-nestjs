import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { LaboratoryRepository } from '../../../../_libs/database/repository/laboratory/radiology.repository'
import {
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratoryUpsertBody,
} from './request'

@Injectable()
export class ApiLaboratoryService {
  constructor(private readonly laboratoryRepository: LaboratoryRepository) { }

  async pagination(oid: number, query: LaboratoryPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.laboratoryRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
      },
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: LaboratoryGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.laboratoryRepository.findMany({
      relation,
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
      },
      sort,
      limit,
    })
    return { data }
  }

  async exampleList(): Promise<BaseResponse> {
    const data = await this.laboratoryRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: LaboratoryGetOneQuery): Promise<BaseResponse> {
    const laboratory = await this.laboratoryRepository.findOne({
      relation: query?.relation,
      condition: { oid, id },
    })
    if (!laboratory) throw new BusinessException('error.Database.NotFound')
    return { data: { laboratory } }
  }

  async createOne(oid: number, body: LaboratoryUpsertBody): Promise<BaseResponse> {
    const laboratory = await this.laboratoryRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })

    return { data: { laboratory } }
  }

  async updateOne(oid: number, id: number, body: LaboratoryUpsertBody): Promise<BaseResponse> {
    const [laboratory] = await this.laboratoryRepository.updateAndReturnEntity({ oid, id }, body)
    if (!laboratory) throw new BusinessException('error.Database.UpdateFailed')

    return { data: { laboratory } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.laboratoryRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    const laboratory = await this.laboratoryRepository.findOneById(id)
    return { data: { laboratory } }
  }
}
