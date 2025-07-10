import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue, ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { LaboratoryGroup } from '../../../../_libs/database/entities'
import Discount, {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Laboratory, {
  LaboratoryInsertType,
  LaboratoryValueType,
} from '../../../../_libs/database/entities/laboratory.entity'
import Position, {
  PositionInsertType,
  PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import {
  DiscountRepository,
  LaboratoryGroupRepository,
  PositionRepository,
} from '../../../../_libs/database/repositories'
import { LaboratoryRepository } from '../../../../_libs/database/repositories/laboratory.repository'
import { TicketLaboratoryRepository } from '../../../../_libs/database/repositories/ticket-laboratory.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  LaboratoryCreateBody,
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratoryRelationQuery,
  LaboratorySystemCopyBody,
  LaboratoryUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository
  ) { }

  async pagination(oid: number, query: LaboratoryPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.laboratoryRepository.pagination({
      // relation: {
      //   laboratoryGroup: relation?.laboratoryGroup,
      // },
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
    if (query.relation) {
      await this.generateRelation({ oid, laboratoryList: data, relation: query.relation })
    }
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: LaboratoryGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.laboratoryRepository.findMany({
      // relation: {
      //   laboratoryGroup: relation?.laboratoryGroup,
      // },
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
        level: filter?.level,
        parentId: filter?.parentId,
      },
      sort,
      limit,
    })
    if (query.relation) {
      await this.generateRelation({ oid, laboratoryList: data, relation: query.relation })
    }
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
    if (query.relation) {
      await this.generateRelation({ oid, laboratoryList: [laboratory], relation: query.relation })
    }
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
    const { laboratory, laboratoryChildren, discountList, positionList } = body
    const laboratoryParentId = await this.laboratoryRepository.insertOneFullField({
      ...laboratory,
      oid,
      level: 1,
      parentId: 0,
    })
    const laboratoryParent = await this.laboratoryRepository.updateOneAndReturnEntity(
      { oid, id: laboratoryParentId },
      { parentId: laboratoryParentId }
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children && laboratoryChildren.length) {
      const childrenDto = laboratoryChildren.map((i) => {
        const childDto: LaboratoryInsertType = {
          ...i,
          oid,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          level: 2,
          parentId: laboratoryParent.id,
        }
        return childDto
      })
      laboratoryParent.children =
        await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(childrenDto)
    }

    this.socketEmitService.laboratoryListChange(oid, { laboratoryUpsertedList: [laboratoryParent] })

    if (positionList?.length) {
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: laboratoryParent.id,
          positionType: PositionInteractType.Laboratory,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      laboratoryParent.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
      })
    }

    if (discountList?.length) {
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: laboratoryParent.id,
          discountInteractType: DiscountInteractType.Laboratory,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      laboratoryParent.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, { discountUpsertedList })
    }

    return { data: { laboratory: laboratoryParent } }
  }

  async update(oid: number, id: number, body: LaboratoryUpdateBody): Promise<BaseResponse> {
    const { laboratory: laboratoryUpdateDto, laboratoryChildren, discountList, positionList } = body
    const laboratoryOrigin = await this.laboratoryRepository.findOneBy({ oid, id })
    if (!laboratoryOrigin) {
      throw new BusinessException('error.Database.NotFound')
    }
    if (laboratoryOrigin.valueType === LaboratoryValueType.Children) {
      // nếu trước đây nó có các laboratory con, giờ mà không dùng nữa thì xóa đi thôi
      if (laboratoryUpdateDto.valueType !== LaboratoryValueType.Children) {
        await this.laboratoryRepository.delete({
          oid,
          level: 2,
          parentId: id,
        })
      }
    }

    const laboratory = await this.laboratoryRepository.updateOneAndReturnEntity(
      { oid, id },
      laboratoryUpdateDto
    )

    if (laboratory.valueType === LaboratoryValueType.Children) {
      await this.laboratoryRepository.updateChildren({
        oid,
        laboratoryParent: laboratory,
        laboratoryChildrenDtoList: laboratoryChildren,
      })
    }

    this.socketEmitService.laboratoryListChange(oid, { laboratoryUpsertedList: [laboratory] })

    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: laboratory.id,
        positionType: PositionInteractType.Laboratory,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: laboratory.id,
          positionType: PositionInteractType.Laboratory,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      laboratory.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: laboratory.id,
        discountInteractType: DiscountInteractType.Laboratory,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: laboratory.id,
          discountInteractType: DiscountInteractType.Laboratory,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      laboratory.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }
    return { data: { laboratory } }
  }

  async destroy(oid: number, laboratoryId: number): Promise<BaseResponse> {
    const ticketLaboratoryList = await this.ticketLaboratoryRepository.findMany({
      condition: { oid, laboratoryId },
      limit: 10,
    })
    if (ticketLaboratoryList.length > 0) {
      return {
        data: { ticketLaboratoryList },
        success: false,
      }
    }

    const [positionDestroyedList, discountDestroyedList] = await Promise.all([
      this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: laboratoryId,
        positionType: PositionInteractType.Laboratory,
      }),
      this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: laboratoryId,
        discountInteractType: DiscountInteractType.Laboratory,
      }),
    ])

    if (positionDestroyedList.length) {
      this.socketEmitService.positionListChange(oid, { positionDestroyedList })
    }

    if (discountDestroyedList.length) {
      this.socketEmitService.discountListChange(oid, { discountDestroyedList })
    }

    const laboratoryDestroyedList = await this.laboratoryRepository.deleteAndReturnEntity({
      oid,
      parentId: laboratoryId,
    })
    this.socketEmitService.laboratoryListChange(oid, { laboratoryDestroyedList })

    return { data: { ticketLaboratoryList: [], laboratoryId } }
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
        costPrice: i.costPrice,
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
          costPrice: i.costPrice,
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

  async generateRelation(options: {
    oid: number
    laboratoryList: Laboratory[]
    relation: LaboratoryRelationQuery
  }) {
    const { oid, laboratoryList, relation } = options
    const laboratoryIdList = ESArray.uniqueArray(laboratoryList.map((i) => i.id))
    const laboratoryGroupIdList = ESArray.uniqueArray(
      laboratoryList.map((i) => i.laboratoryGroupId)
    )

    const [positionList, discountList, laboratoryGroupList] = await Promise.all([
      relation?.positionList && laboratoryIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: PositionInteractType.Laboratory,
          positionInteractId: { IN: laboratoryIdList },
        })
        : <Position[]>[],
      relation?.discountList && laboratoryIdList.length
        ? this.discountRepository.findManyBy({
          oid,
          discountInteractType: DiscountInteractType.Laboratory,
          discountInteractId: { IN: [...laboratoryIdList, 0] }, // discountInteractId=0 là áp dụng cho tất cả
        })
        : <Discount[]>[],
      relation?.laboratoryGroup && laboratoryGroupIdList.length
        ? this.laboratoryGroupRepository.findManyBy({
          oid,
          id: { IN: laboratoryGroupIdList },
        })
        : <LaboratoryGroup[]>[],
    ])

    const laboratoryGroupMap = ESArray.arrayToKeyValue(laboratoryGroupList, 'id')

    laboratoryList.forEach((laboratory: Laboratory) => {
      if (relation?.positionList) {
        laboratory.positionList = positionList.filter((i) => i.positionInteractId === laboratory.id)
      }
      if (relation?.discountList) {
        laboratory.discountList = discountList.filter((i) => i.discountInteractId === laboratory.id)
        laboratory.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.laboratoryGroup) {
        laboratory.laboratoryGroup = laboratoryGroupMap[laboratory.laboratoryGroupId]
      }
    })

    return laboratoryList
  }
}
