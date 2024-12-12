import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { LaboratoryGroupRepository } from '../../../../_libs/database/repositories/laboratory-group.repository'
import {
  LaboratoryGroupCreateBody,
  LaboratoryGroupGetManyQuery,
  LaboratoryGroupPaginationQuery,
  LaboratoryGroupReplaceAllBody,
  LaboratoryGroupUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratoryGroupService {
  constructor(private readonly laboratoryGroupRepository: LaboratoryGroupRepository) { }

  async pagination(oid: number, query: LaboratoryGroupPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.laboratoryGroupRepository.pagination({
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

  async getMany(oid: number, query: LaboratoryGroupGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.laboratoryGroupRepository.findMany({
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
    const laboratoryGroup = await this.laboratoryGroupRepository.findOneBy({ oid, id })
    if (!laboratoryGroup) throw new BusinessException('error.Database.NotFound')
    return { data: { laboratoryGroup } }
  }

  async createOne(oid: number, body: LaboratoryGroupCreateBody): Promise<BaseResponse> {
    const laboratoryGroup = await this.laboratoryGroupRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    return { data: { laboratoryGroup } }
  }

  async updateOne(oid: number, id: number, body: LaboratoryGroupUpdateBody): Promise<BaseResponse> {
    const laboratoryGroupList = await this.laboratoryGroupRepository.updateAndReturnEntity(
      { id, oid },
      body
    )
    return { data: { laboratoryGroup: laboratoryGroupList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.laboratoryGroupRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: true }
  }

  async replaceAll(oid: number, body: LaboratoryGroupReplaceAllBody): Promise<BaseResponse> {
    await this.laboratoryGroupRepository.replaceAll(oid, body.laboratoryGroupReplaceAll)
    return { data: true }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.laboratoryGroupRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }
}
