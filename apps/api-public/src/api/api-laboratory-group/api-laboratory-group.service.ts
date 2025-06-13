import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType,
} from '../../../../_libs/database/entities/laboratory-group.entity'
import {
  LaboratoryGroupManager,
  LaboratoryGroupRepository,
} from '../../../../_libs/database/repositories/laboratory-group.repository'
import {
  LaboratoryGroupGetManyQuery,
  LaboratoryGroupPaginationQuery,
  LaboratoryGroupReplaceAllBody,
  LaboratoryGroupUpsertBody,
} from './request'

@Injectable()
export class ApiLaboratoryGroupService {
  constructor(
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository,
    private readonly laboratoryGroupManager: LaboratoryGroupManager
  ) { }

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

  async createOne(oid: number, body: LaboratoryGroupUpsertBody): Promise<BaseResponse> {
    const laboratoryGroup = await this.laboratoryGroupRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    return { data: { laboratoryGroup } }
  }

  async updateOne(oid: number, id: number, body: LaboratoryGroupUpsertBody): Promise<BaseResponse> {
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
    const laboratoryGroupInsertLit = body.laboratoryGroupReplaceAll
      .filter((i) => !i.id)
      .map((i) => {
        const insertDto: LaboratoryGroupInsertType = {
          name: i.name,
          roomId: i.roomId,
          printHtmlId: i.printHtmlId,
          oid,
        }
        return insertDto
      })
    const laboratoryGroupUpdateLit = body.laboratoryGroupReplaceAll
      .filter((i) => !!i.id)
      .map((i) => {
        const insertDto: LaboratoryGroupUpdateType & { id: number } = {
          name: i.name,
          roomId: i.roomId,
          printHtmlId: i.printHtmlId,
          id: i.id,
        }
        return insertDto
      })

    await this.laboratoryGroupRepository.delete({
      oid,
      id: { NOT_IN: laboratoryGroupUpdateLit.map((i) => i.id) },
    })

    if (laboratoryGroupInsertLit.length) {
      await this.laboratoryGroupRepository.insertMany(laboratoryGroupInsertLit)
    }
    if (laboratoryGroupUpdateLit.length) {
      await this.laboratoryGroupManager.bulkUpdate({
        manager: this.laboratoryGroupRepository.getManager(),
        condition: { oid },
        compare: ['id'],
        update: ['name', 'roomId', 'printHtmlId'],
        tempList: laboratoryGroupUpdateLit,
        options: { requireEqualLength: true },
      })
    }

    return { data: true }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.laboratoryGroupRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }

  async createByGroupName(oid: number, groupName: string[]) {
    const laboratoryGroupAll = await this.laboratoryGroupRepository.findManyBy({ oid })
    const groupNameList = laboratoryGroupAll.map((i) => i.name)

    const groupNameClean = ESArray.uniqueArray(groupName).filter((i) => !!i)
    const groupNameNoExist = groupNameClean.filter((i) => {
      return !groupNameList.includes(i)
    })
    const lgCreateList = groupNameNoExist.map((i) => {
      const dto: LaboratoryGroupInsertType = {
        oid,
        name: i,
        printHtmlId: 0,
        roomId: 0,
      }
      return dto
    })
    const lgInsertedList =
      await this.laboratoryGroupRepository.insertManyAndReturnEntity(lgCreateList)

    return [...laboratoryGroupAll, ...lgInsertedList]
  }
}
