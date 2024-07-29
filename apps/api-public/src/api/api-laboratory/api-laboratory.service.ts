import { HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  LaboratoryInsertType,
  LaboratoryValueType,
} from '../../../../_libs/database/entities/laboratory.entity'
import { LaboratoryRepository } from '../../../../_libs/database/repository/laboratory/laboratory.repository'
import { TicketLaboratoryRepository } from '../../../../_libs/database/repository/ticket-laboratory/ticket-laboratory.repository'
import {
  LaboratoryCreateBody,
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratorySystemCopyBody,
  LaboratoryUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratoryService {
  constructor(
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository
  ) { }

  async pagination(oid: number, query: LaboratoryPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.laboratoryRepository.pagination({
      relation: {
        laboratoryGroup: relation?.laboratoryGroup,
      },
      page,
      limit,
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
        level: filter?.level,
        parentId: filter?.parentId,
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
      relation: {
        laboratoryGroup: relation?.laboratoryGroup,
      },
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
        level: filter?.level,
        parentId: filter?.parentId,
      },
      sort,
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: LaboratoryGetOneQuery): Promise<BaseResponse> {
    const laboratory = await this.laboratoryRepository.findOne({
      relation: {
        laboratoryGroup: query?.relation?.laboratoryGroup,
      },
      condition: { oid, id },
    })
    if (!laboratory) throw new BusinessException('error.Database.NotFound')
    if (query?.relation?.children) {
      if (laboratory.valueType === LaboratoryValueType.Children) {
        laboratory.children = await this.laboratoryRepository.findMany({
          condition: {
            oid,
            parentId: laboratory.id,
            level: 2,
          },
          sort: { priority: 'ASC' },
        })
      }
    }

    return { data: { laboratory } }
  }

  async create(oid: number, body: LaboratoryCreateBody): Promise<BaseResponse> {
    const { children, ...laboratoryCreateDto } = body
    const laboratoryParentId = await this.laboratoryRepository.insertOneFullField({
      ...laboratoryCreateDto,
      oid,
      level: 1,
      parentId: 0,
    })
    const [laboratoryParent] = await this.laboratoryRepository.updateAndReturnEntity(
      { oid, id: laboratoryParentId },
      { parentId: laboratoryParentId }
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children && children.length) {
      const childrenDto = children.map((i) => {
        const childDto: LaboratoryInsertType = {
          ...i,
          oid,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          level: 2,
          parentId: laboratoryParent.id,
        }
        return childDto
      })
      await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(childrenDto)
    }

    return { data: { laboratory: laboratoryParent } }
  }

  async update(oid: number, id: number, body: LaboratoryUpdateBody): Promise<BaseResponse> {
    const { children, ...laboratoryUpdateDto } = body
    const [laboratory] = await this.laboratoryRepository.updateAndReturnEntity(
      { oid, id },
      laboratoryUpdateDto
    )
    if (!laboratory) throw new BusinessException('error.Database.UpdateFailed')

    if (laboratory.valueType === LaboratoryValueType.Children) {
      await this.laboratoryRepository.updateChildren({
        oid,
        laboratoryParent: laboratory,
        laboratoryChildrenDtoList: children,
      })
    }
    return { data: { laboratory } }
  }

  async destroy(oid: number, id: number): Promise<BaseResponse> {
    const countTicketLaboratory = await this.ticketLaboratoryRepository.countBy({
      oid,
      laboratoryId: id,
    })
    if (countTicketLaboratory > 0) {
      return {
        data: { countTicketLaboratory },
        success: false,
      }
    }
    const affected = await this.laboratoryRepository.delete({ oid, parentId: id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: { countTicketLaboratory: 0, laboratoryId: id } }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.laboratoryRepository.findMany({
      condition: { oid: 1 },
      sort: { priority: 'ASC' },
    })
    return { data }
  }

  async systemCopy(oid: number, body: LaboratorySystemCopyBody): Promise<BaseResponse> {
    const laboratorySystem = await this.laboratoryRepository.findMany({
      condition: { oid: 1, parentId: { IN: body.laboratoryIdList } },
      sort: { priority: 'ASC' },
    })

    const laboratoryList = laboratorySystem.filter((i) => i.level === 1)
    const laboratoryMap = arrayToKeyValue(laboratoryList, 'id')
    laboratorySystem.forEach((i) => {
      if (!laboratoryMap[i.parentId].children) {
        laboratoryMap[i.parentId].children = []
      }
      if (i.level === 2) {
        laboratoryMap[i.parentId].children?.push(i)
      }
    })

    // Insert cho level 1
    const laboratoryParentInsertList: LaboratoryInsertType[] = laboratoryList.map((i) => {
      const dto: LaboratoryInsertType = {
        oid,
        name: i.name,
        price: i.price,
        laboratoryGroupId: 0,
        level: i.level,
        valueType: i.valueType,
        lowValue: i.lowValue,
        highValue: i.highValue,
        unit: i.unit,
        options: i.options,
        parentId: 0, // cập nhật sau
        priority: 0, // cập nhật sau
      }
      return dto
    })
    const laboratoryParentIds = await this.laboratoryRepository.insertMany(
      laboratoryParentInsertList
    )
    await this.laboratoryRepository.update(
      { id: { IN: laboratoryParentIds } },
      {
        parentId: () => `"id"`,
        priority: () => `"id"`,
      }
    )

    // Insert cho level 2
    const laboratoryChildInsertList: LaboratoryInsertType[] = laboratoryList
      .map((i, index) => {
        i.children.forEach((c, j) => {
          c.parentId = laboratoryParentIds[index]
          c.priority = j + 1
        })
        return i.children
      })
      .flat()
      .map((i) => {
        const dto: LaboratoryInsertType = {
          oid,
          name: i.name,
          price: i.price,
          laboratoryGroupId: 0,
          level: i.level,
          valueType: i.valueType,
          lowValue: i.lowValue,
          highValue: i.highValue,
          unit: i.unit,
          options: i.options,
          parentId: i.parentId,
          priority: i.priority,
        }
        return dto
      })
    await this.laboratoryRepository.insertMany(laboratoryChildInsertList)

    return { data: true }
  }
}
