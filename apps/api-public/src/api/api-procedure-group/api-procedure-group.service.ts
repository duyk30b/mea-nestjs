import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ProcedureGroupInsertType } from '../../../../_libs/database/entities/procedure-group.entity'
import { ProcedureGroupRepository } from '../../../../_libs/database/repositories/procedure-group.repository'
import {
  ProcedureGroupCreateBody,
  ProcedureGroupGetManyQuery,
  ProcedureGroupPaginationQuery,
  ProcedureGroupReplaceAllBody,
  ProcedureGroupUpdateBody,
} from './request'

@Injectable()
export class ApiProcedureGroupService {
  constructor(private readonly procedureGroupRepository: ProcedureGroupRepository) { }

  async pagination(oid: number, query: ProcedureGroupPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.procedureGroupRepository.pagination({
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

  async getMany(oid: number, query: ProcedureGroupGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.procedureGroupRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.procedureGroupRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async replaceAll(oid: number, body: ProcedureGroupReplaceAllBody): Promise<BaseResponse> {
    await this.procedureGroupRepository.replaceAll(oid, body.procedureGroupReplaceAll)
    return { data: true }
  }

  async createOne(oid: number, body: ProcedureGroupCreateBody): Promise<BaseResponse> {
    const id = await this.procedureGroupRepository.insertOneBasic({ oid, ...body })
    const data = await this.procedureGroupRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: ProcedureGroupUpdateBody): Promise<BaseResponse> {
    const affected = await this.procedureGroupRepository.updateBasic({ id, oid }, body)
    const data = await this.procedureGroupRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.procedureGroupRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }

  async createByGroupName(oid: number, groupName: string[]) {
    const procedureGroupAll = await this.procedureGroupRepository.findManyBy({ oid })
    const groupNameList = procedureGroupAll.map((i) => i.name)

    const groupNameClean = ESArray.uniqueArray(groupName).filter((i) => !!i)
    const groupNameNoExist = groupNameClean.filter((i) => {
      return !groupNameList.includes(i)
    })
    const lgCreateList = groupNameNoExist.map((i) => {
      const dto: ProcedureGroupInsertType = {
        oid,
        name: i,
      }
      return dto
    })
    const lgInsertedList = await this.procedureGroupRepository.insertMany(lgCreateList)

    return [...procedureGroupAll, ...lgInsertedList]
  }
}
