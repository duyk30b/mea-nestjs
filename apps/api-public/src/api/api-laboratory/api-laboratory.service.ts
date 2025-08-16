import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue, ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BusinessError } from '../../../../_libs/database/common/error'
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
import { ApiLaboratoryGroupService } from '../api-laboratory-group/api-laboratory-group.service'
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
    private readonly discountRepository: DiscountRepository,
    private readonly apiLaboratoryGroupService: ApiLaboratoryGroupService
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
    const { laboratory: laboratoryBody, laboratoryChildren, discountList, positionList } = body

    let laboratoryCode = laboratoryBody.laboratoryCode
    let maxId = await this.laboratoryRepository.getMaxId()
    maxId++
    if (!laboratoryCode) {
      laboratoryCode = maxId.toString()
    }

    const existLaboratory = await this.laboratoryRepository.findOneBy({
      oid,
      laboratoryCode,
    })
    if (existLaboratory) {
      throw new BusinessError(`Trùng mã xét nghiệm với ${existLaboratory.name}`)
    }

    const laboratoryParentId = await this.laboratoryRepository.insertOneFullField({
      ...laboratoryBody,
      oid,
      level: 1,
      parentId: 0,
      laboratoryCode,
    })
    const laboratoryParent = await this.laboratoryRepository.updateOneAndReturnEntity(
      { oid, id: laboratoryParentId },
      { parentId: laboratoryParentId }
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children && laboratoryChildren.length) {
      const childrenDto = laboratoryChildren.map((i) => {
        maxId++
        const childDto: LaboratoryInsertType = {
          ...i,
          oid,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          level: 2,
          parentId: laboratoryParent.id,
          laboratoryCode: maxId.toString(),
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

  async update(
    oid: number,
    laboratoryId: number,
    body: LaboratoryUpdateBody
  ): Promise<BaseResponse> {
    const { laboratory: laboratoryBody, laboratoryChildren, discountList, positionList } = body
    const laboratoryOrigin = await this.laboratoryRepository.findOneBy({ oid, id: laboratoryId })
    if (!laboratoryOrigin) {
      throw new BusinessException('error.Database.NotFound')
    }
    if (laboratoryOrigin.valueType === LaboratoryValueType.Children) {
      // nếu trước đây nó có các laboratory con, giờ mà không dùng nữa thì xóa đi thôi
      if (laboratoryBody.valueType !== LaboratoryValueType.Children) {
        await this.laboratoryRepository.delete({
          oid,
          level: 2,
          parentId: laboratoryId,
        })
      }
    }

    if (laboratoryBody.laboratoryCode != null) {
      const existLaboratory = await this.laboratoryRepository.findOneBy({
        oid,
        laboratoryCode: laboratoryBody.laboratoryCode,
        id: { NOT: laboratoryId },
      })
      if (existLaboratory) {
        throw new BusinessError(`Trùng mã xét nghiệm với ${existLaboratory.name}`)
      }
    }

    const laboratoryParent = await this.laboratoryRepository.updateOneAndReturnEntity(
      { oid, id: laboratoryId },
      laboratoryBody
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children) {
      await this.laboratoryRepository.delete({
        oid,
        parentId: laboratoryId,
        level: 2,
      })
      let maxId = await this.laboratoryRepository.getMaxId()
      const laboratoryChildrenCreate = laboratoryChildren.map((i) => {
        maxId++
        const dto: LaboratoryInsertType = {
          ...laboratoryBody,
          oid,
          level: 2,
          parentId: laboratoryId,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          laboratoryCode: maxId.toString(),
        }
        return dto
      })
      await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(laboratoryChildrenCreate)
    }

    this.socketEmitService.laboratoryListChange(oid, { laboratoryUpsertedList: [laboratoryParent] })

    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: laboratoryId,
        positionType: PositionInteractType.Laboratory,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: laboratoryId,
          positionType: PositionInteractType.Laboratory,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      laboratoryParent.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: laboratoryId,
        discountInteractType: DiscountInteractType.Laboratory,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: laboratoryId,
          discountInteractType: DiscountInteractType.Laboratory,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      laboratoryParent.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }
    return { data: { laboratory: laboratoryParent } }
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
    const laboratorySystemList = await this.laboratoryRepository.findMany({
      relation: { laboratoryGroup: true },
      condition: { oid: 1, parentId: { IN: body.laboratoryIdList } },
      sort: { priority: 'ASC' },
    })

    const laboratoryParentSystemList = laboratorySystemList.filter((i) => i.level === 1)
    const laboratoryParentSystemMap = arrayToKeyValue(laboratoryParentSystemList, 'id')
    laboratorySystemList.forEach((i) => {
      if (!laboratoryParentSystemMap[i.parentId].children) {
        laboratoryParentSystemMap[i.parentId].children = []
      }
      if (i.level === 2) {
        laboratoryParentSystemMap[i.parentId].children?.push(i)
      }
    })

    const groupNameList = laboratoryParentSystemList.map((i) => i.laboratoryGroup?.name || '')
    const laboratoryGroupList = await this.apiLaboratoryGroupService.createByGroupName(
      oid,
      groupNameList
    )
    const laboratoryGroupMapName = ESArray.arrayToKeyValue(laboratoryGroupList, 'name')

    let maxId = await this.laboratoryRepository.getMaxId()

    // Insert cho level 1
    const laboratoryParentInsertList: LaboratoryInsertType[] = laboratoryParentSystemList.map(
      (i) => {
        let laboratoryGroupId = 0
        const laboratoryGroupName = i.laboratoryGroup?.name
        if (laboratoryGroupName) {
          laboratoryGroupId = laboratoryGroupMapName[laboratoryGroupName]?.id || 0
        }
        maxId++
        const dto: LaboratoryInsertType = {
          oid,
          name: i.name,
          costPrice: i.costPrice,
          price: i.price,
          laboratoryGroupId,
          level: i.level,
          valueType: i.valueType,
          lowValue: i.lowValue,
          highValue: i.highValue,
          unit: i.unit,
          options: i.options,
          parentId: 0, // cập nhật sau
          priority: 0, // cập nhật sau
          laboratoryCode: maxId.toString(),
        }
        return dto
      }
    )
    const laboratoryParentCreatedList = await this.laboratoryRepository.insertManyAndReturnEntity(
      laboratoryParentInsertList
    )
    await this.laboratoryRepository.update(
      { id: { IN: laboratoryParentCreatedList.map((i) => i.id) } },
      {
        parentId: () => `"id"`,
        priority: () => `"id"`,
      }
    )

    // Insert cho level 2
    const laboratoryChildInsertList: LaboratoryInsertType[] = laboratoryParentSystemList
      .map((i, index) => {
        i.children.forEach((c, j) => {
          const lp = laboratoryParentCreatedList[index]
          c.parentId = lp.id
          c.laboratoryGroupId = lp.laboratoryGroupId
          c.priority = j + 1
        })
        return i.children
      })
      .flat()
      .map((i) => {
        maxId++
        const dto: LaboratoryInsertType = {
          oid,
          name: i.name,
          price: i.price,
          costPrice: i.costPrice,
          laboratoryGroupId: i.laboratoryGroupId,
          level: i.level,
          valueType: i.valueType,
          lowValue: i.lowValue,
          highValue: i.highValue,
          unit: i.unit,
          options: i.options,
          parentId: i.parentId,
          priority: i.priority,
          laboratoryCode: maxId.toString(),
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
