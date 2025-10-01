import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESTimer } from '../../../../../_libs/common/helpers'
import { arrayToKeyValue, ESArray } from '../../../../../_libs/common/helpers/array.helper'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { LaboratoryGroup } from '../../../../../_libs/database/entities'
import Discount, {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../../_libs/database/entities/discount.entity'
import Laboratory, {
  LaboratoryInsertType,
  LaboratoryValueType,
} from '../../../../../_libs/database/entities/laboratory.entity'
import Position, {
  PositionInsertType,
  PositionType,
} from '../../../../../_libs/database/entities/position.entity'
import {
  DiscountRepository,
  LaboratoryGroupRepository,
  PositionRepository,
} from '../../../../../_libs/database/repositories'
import { LaboratoryRepository } from '../../../../../_libs/database/repositories/laboratory.repository'
import { TicketLaboratoryRepository } from '../../../../../_libs/database/repositories/ticket-laboratory.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { LaboratoryGroupService } from '../laboratory-group/laboratory-group.service'
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
export class LaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly laboratoryGroupService: LaboratoryGroupService
  ) { }

  async pagination(oid: number, query: LaboratoryPaginationQuery) {
    const { page, limit, filter, relation, sort } = query
    const { data: laboratoryList, total } = await this.laboratoryRepository.pagination({
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
      await this.generateRelation({ oid, laboratoryList, relation: query.relation })
    }
    return { laboratoryList, page, limit, total }
  }

  async getMany(oid: number, query: LaboratoryGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const laboratoryList = await this.laboratoryRepository.findMany({
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
      await this.generateRelation({ oid, laboratoryList, relation: query.relation })
    }
    return { laboratoryList }
  }

  async getOne(oid: number, id: number, query: LaboratoryGetOneQuery) {
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

    return { laboratory }
  }

  async create(oid: number, body: LaboratoryCreateBody) {
    const {
      laboratory: laboratoryBody,
      laboratoryChildren,
      discountList,
      positionRequestList,
    } = body

    let laboratoryCode = laboratoryBody.laboratoryCode
    if (laboratoryCode) {
      const existLaboratory = await this.laboratoryRepository.findOneBy({
        oid,
        laboratoryCode,
      })
      if (existLaboratory) {
        throw new BusinessError(`Trùng mã xét nghiệm với ${existLaboratory.name}`)
      }
    } else {
      laboratoryCode = ESTimer.timeToText(new Date(), 'YYMMDDhhmmss')
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
        const childDto: LaboratoryInsertType = {
          ...i,
          oid,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          level: 2,
          parentId: laboratoryParent.id,
          laboratoryCode: '',
        }
        return childDto
      })
      await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(childrenDto)
    }

    if (positionRequestList?.length) {
      const positionDtoList: PositionInsertType[] = positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: laboratoryParent.id,
          positionType: PositionType.LaboratoryRequest,
        }
        return dto
      })
      await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
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
      await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
    }

    this.socketEmitService.socketMasterDataChange(oid, {
      laboratory: true,
      position: !!positionRequestList?.length,
      discount: !!discountList?.length,
    })

    return { laboratory: laboratoryParent }
  }

  async update(oid: number, laboratoryId: number, body: LaboratoryUpdateBody) {
    const {
      laboratory: laboratoryBody,
      laboratoryChildren,
      discountList,
      positionRequestList,
    } = body
    const laboratoryOrigin = await this.laboratoryRepository.findOneBy({ oid, id: laboratoryId })
    if (!laboratoryOrigin) {
      throw new BusinessException('error.Database.NotFound')
    }
    let laboratoryCode = laboratoryBody.laboratoryCode
    if (laboratoryCode) {
      const existLaboratory = await this.laboratoryRepository.findOneBy({
        oid,
        laboratoryCode,
        id: { NOT: laboratoryId },
      })
      if (existLaboratory) {
        throw new BusinessError(`Trùng mã xét nghiệm với ${existLaboratory.name}`)
      }
    } else {
      laboratoryCode = ESTimer.timeToText(new Date(), 'YYMMDDhhmmss')
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

    const laboratoryParent = await this.laboratoryRepository.updateOneAndReturnEntity(
      { oid, id: laboratoryId },
      { ...laboratoryBody, laboratoryCode }
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children) {
      const laboratoryChildUpdateList = laboratoryChildren.filter((i) => !!i.id)
      const laboratoryChildInsertList = laboratoryChildren.filter((i) => !i.id)

      await this.laboratoryRepository.deleteAndReturnEntity({
        oid,
        parentId: laboratoryId,
        level: 2,
        laboratoryGroupId: laboratoryParent.laboratoryGroupId,
        id: { NOT_IN: [0, ...laboratoryChildUpdateList.map((i) => i.id)] },
      })

      if (laboratoryChildInsertList.length) {
        await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(
          laboratoryChildInsertList.map((i) => {
            const dto: LaboratoryInsertType = {
              ...laboratoryBody,
              laboratoryCode: '',
              oid,
              level: 2,
              parentId: laboratoryId,
              laboratoryGroupId: laboratoryParent.laboratoryGroupId,
            }
            return dto
          })
        )
      }

      if (laboratoryChildUpdateList.length) {
        await this.laboratoryRepository.managerBulkUpdate({
          condition: {
            oid,
            level: 2,
            parentId: laboratoryId,
          },
          tempList: laboratoryChildUpdateList.map((i) => {
            return {
              id: i.id,
              laboratoryCode: '',
              priority: i.priority,
              name: i.name,
              lowValue: i.lowValue,
              highValue: i.highValue,
              valueType: i.valueType,
              unit: i.unit,
              options: i.options,
              laboratoryGroupId: laboratoryParent.laboratoryGroupId,
            }
          }),
          compare: ['id'],
          update: [
            'priority',
            'laboratoryCode',
            'name',
            'lowValue',
            'highValue',
            'valueType',
            'unit',
            'options',
            'laboratoryGroupId',
          ],
          options: { requireEqualLength: true },
        })
      }
    }

    if (positionRequestList) {
      await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: laboratoryId,
        positionType: PositionType.LaboratoryRequest,
      })
      await this.positionRepository.insertManyFullFieldAndReturnEntity(
        positionRequestList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: laboratoryId,
            positionType: PositionType.LaboratoryRequest,
          }
          return dto
        })
      )
    }

    if (discountList) {
      await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: laboratoryId,
        discountInteractType: DiscountInteractType.Laboratory,
      })
      await this.discountRepository.insertManyFullFieldAndReturnEntity(
        discountList.map((i) => {
          const dto: DiscountInsertType = {
            ...i,
            discountInteractId: laboratoryId,
            discountInteractType: DiscountInteractType.Laboratory,
            oid,
          }
          return dto
        })
      )
    }

    this.socketEmitService.socketMasterDataChange(oid, {
      laboratory: true,
      position: !!positionRequestList,
      discount: !!discountList,
    })

    return { laboratory: laboratoryParent }
  }

  async destroy(oid: number, laboratoryId: number) {
    const ticketLaboratoryList = await this.ticketLaboratoryRepository.findMany({
      condition: { oid, laboratoryId },
      limit: 10,
    })
    if (!ticketLaboratoryList.length) {
      const [laboratoryDestroyedList, positionDestroyedList, discountDestroyedList] =
        await Promise.all([
          this.laboratoryRepository.deleteAndReturnEntity({
            oid,
            parentId: laboratoryId,
          }),
          this.positionRepository.deleteAndReturnEntity({
            oid,
            positionInteractId: laboratoryId,
            positionType: PositionType.LaboratoryRequest,
          }),
          this.discountRepository.deleteAndReturnEntity({
            oid,
            discountInteractId: laboratoryId,
            discountInteractType: DiscountInteractType.Laboratory,
          }),
        ])

      this.socketEmitService.socketMasterDataChange(oid, {
        laboratory: !!laboratoryDestroyedList.length,
        position: !!positionDestroyedList.length,
        discount: !!discountDestroyedList.length,
      })
    }

    return { ticketLaboratoryList: [], laboratoryId, success: !ticketLaboratoryList.length }
  }

  async systemList() {
    const laboratorySystemList = await this.laboratoryRepository.findMany({
      condition: { oid: 1 },
      sort: { priority: 'ASC' },
    })
    return { laboratorySystemList }
  }

  async systemCopy(oid: number, body: LaboratorySystemCopyBody) {
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
    const laboratoryGroupList = await this.laboratoryGroupService.createByGroupName(
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
    await this.laboratoryRepository.updateBasic(
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

    return { success: true }
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
          positionType: PositionType.LaboratoryRequest,
          positionInteractId: { IN: [...laboratoryIdList, 0] },
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
      if (relation?.laboratoryGroup) {
        laboratory.laboratoryGroup = laboratoryGroupMap[laboratory.laboratoryGroupId]
      }
      if (relation?.discountList) {
        laboratory.discountList = discountList.filter((i) => i.discountInteractId === laboratory.id)
        laboratory.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.positionList) {
        laboratory.positionRequestListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.LaboratoryRequest && i.positionInteractId === 0
        })
        laboratory.positionRequestList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.LaboratoryRequest
            && i.positionInteractId === laboratory.id
          )
        })
      }
    })

    return laboratoryList
  }
}
