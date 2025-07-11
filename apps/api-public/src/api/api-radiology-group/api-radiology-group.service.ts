import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RadiologyGroupInsertType } from '../../../../_libs/database/entities/radiology-group.entity'
import { RadiologyGroupRepository } from '../../../../_libs/database/repositories'
import {
  RadiologyGroupCreateBody,
  RadiologyGroupGetManyQuery,
  RadiologyGroupPaginationQuery,
  RadiologyGroupReplaceAllBody,
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
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const radiologyGroup = await this.radiologyGroupRepository.findOneBy({ oid, id })
    if (!radiologyGroup) throw new BusinessException('error.Database.NotFound')
    return { data: { radiologyGroup } }
  }

  async createOne(oid: number, body: RadiologyGroupCreateBody): Promise<BaseResponse> {
    const radiologyGroup = await this.radiologyGroupRepository.insertOneAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { radiologyGroup } }
  }

  async updateOne(oid: number, id: number, body: RadiologyGroupUpdateBody): Promise<BaseResponse> {
    const radiologyGroupList = await this.radiologyGroupRepository.updateAndReturnEntity(
      { id, oid },
      body
    )
    return { data: { radiologyGroup: radiologyGroupList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.radiologyGroupRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: true }
  }

  async replaceAll(oid: number, body: RadiologyGroupReplaceAllBody): Promise<BaseResponse> {
    await this.radiologyGroupRepository.replaceAll(oid, body.radiologyGroupReplaceAll)
    return { data: true }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.radiologyGroupRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }

  async createByGroupName(oid: number, groupName: string[]) {
    const radiologyGroupAll = await this.radiologyGroupRepository.findManyBy({ oid })
    const groupNameList = radiologyGroupAll.map((i) => i.name)

    const groupNameClean = ESArray.uniqueArray(groupName).filter((i) => !!i)
    const groupNameNoExist = groupNameClean.filter((i) => {
      return !groupNameList.includes(i)
    })
    const lgCreateList = groupNameNoExist.map((i) => {
      const dto: RadiologyGroupInsertType = {
        oid,
        name: i,
      }
      return dto
    })
    const lgInsertedList =
      await this.radiologyGroupRepository.insertManyAndReturnEntity(lgCreateList)

    return [...radiologyGroupAll, ...lgInsertedList]
  }
}
