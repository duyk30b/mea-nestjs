import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import { Discount, RadiologyGroup, TemplateHtml } from '@libs/database/entities'
import {
    DiscountInsertType,
    DiscountInteractType,
} from '@libs/database/entities/discount.entity'
import Position, {
    PositionInsertType,
    PositionType,
} from '@libs/database/entities/position.entity'
import Radiology, {
    RadiologyInsertType,
} from '@libs/database/entities/radiology.entity'
import {
    DiscountRepository,
    PositionRepository,
    RadiologyGroupRepository,
    RadiologyRepository,
    TemplateHtmlRepository,
    TicketRadiologyRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { RadiologyGroupService } from '../radiology-group/radiology-group.service'
import {
    RadiologyGetManyQuery,
    RadiologyGetOneQuery,
    RadiologyPaginationQuery,
    RadiologyRelationQuery,
    RadiologySystemCopyBody,
    RadiologyUpsertBody,
} from './request'

@Injectable()
export class RadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly radiologyGroupRepository: RadiologyGroupRepository,
    private readonly templateHtmlRepository: TemplateHtmlRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly radiologyGroupService: RadiologyGroupService
  ) { }

  async pagination(oid: number, query: RadiologyPaginationQuery) {
    const { page, limit, filter, relation, sort } = query
    const { data: radiologyList, total } = await this.radiologyRepository.pagination({
      // relation: {
      //   templateHtml: query?.relation?.templateHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      page,
      limit,
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        templateHtmlId: filter?.templateHtmlId,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, radiologyList, relation: query.relation })
    }
    return { radiologyList, page, limit, total }
  }

  async getMany(oid: number, query: RadiologyGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const radiologyList = await this.radiologyRepository.findMany({
      // relation: {
      //   templateHtml: query?.relation?.templateHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        templateHtmlId: filter?.templateHtmlId,
        updatedAt: filter?.updatedAt,
      },
      sort,
      limit,
    })
    if (query.relation) {
      await this.generateRelation({ oid, radiologyList, relation: query.relation })
    }
    return { radiologyList }
  }

  async getOne(oid: number, id: number, query: RadiologyGetOneQuery) {
    const radiology = await this.radiologyRepository.findOne({
      // relation: {
      //   templateHtml: query?.relation?.templateHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      condition: { oid, id },
    })
    if (!radiology) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation({ oid, radiologyList: [radiology], relation: query.relation })
    }

    return { radiology }
  }

  async createOne(oid: number, body: RadiologyUpsertBody) {
    const { positionRequestList, positionResultList, radiology: radiologyBody, discountList } = body
    let radiologyCode = radiologyBody.radiologyCode
    if (!radiologyCode) {
      const maxId = await this.radiologyRepository.getMaxId()
      radiologyCode = (maxId + 1).toString()
    }

    const existRadiology = await this.radiologyRepository.findOneBy({
      oid,
      radiologyCode,
    })
    if (existRadiology) {
      throw new BusinessException(`Trùng mã phiếu với ${existRadiology.name}` as any)
    }

    const radiology = await this.radiologyRepository.insertOne({
      ...radiologyBody,
      oid,
      radiologyCode,
    })

    if (positionRequestList?.length) {
      await this.positionRepository.insertMany(
        positionRequestList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: radiology.id,
            positionType: PositionType.RadiologyRequest,
          }
          return dto
        })
      )
    }
    if (positionResultList?.length) {
      await this.positionRepository.insertMany(
        positionResultList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: radiology.id,
            positionType: PositionType.RadiologyResult,
          }
          return dto
        })
      )
    }

    if (discountList?.length) {
      await this.discountRepository.insertMany(
        discountList.map((i) => {
          const dto: DiscountInsertType = {
            ...i,
            discountInteractId: radiology.id,
            discountInteractType: DiscountInteractType.Radiology,
            oid,
          }
          return dto
        })
      )
    }
    this.socketEmitService.socketMasterDataChange(oid, {
      radiology: true,
      position: !!positionRequestList?.length || !!positionResultList?.length,
      discount: !!discountList?.length,
    })
    return { radiology }
  }

  async updateOne(oid: number, radiologyId: number, body: RadiologyUpsertBody) {
    const { positionRequestList, positionResultList, radiology: radiologyBody, discountList } = body

    if (radiologyBody.radiologyCode != null) {
      const existRadiology = await this.radiologyRepository.findOneBy({
        oid,
        radiologyCode: radiologyBody.radiologyCode,
        id: { NOT: radiologyId },
      })
      if (existRadiology) {
        throw new BusinessException(`Trùng mã sản phẩm với ${existRadiology.name}` as any)
      }
    }

    const radiology = await this.radiologyRepository.updateOne(
      { oid, id: radiologyId },
      radiologyBody
    )
    if (positionRequestList) {
      await this.positionRepository.deleteMany({
        oid,
        positionInteractId: radiology.id,
        positionType: PositionType.RadiologyRequest,
      })
      await this.positionRepository.insertMany(
        positionRequestList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: radiology.id,
            positionType: PositionType.RadiologyRequest,
          }
          return dto
        })
      )
    }
    if (positionResultList) {
      await this.positionRepository.deleteMany({
        oid,
        positionInteractId: radiology.id,
        positionType: PositionType.RadiologyResult,
      })
      await this.positionRepository.insertMany(
        positionResultList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: radiology.id,
            positionType: PositionType.RadiologyResult,
          }
          return dto
        })
      )
    }

    if (discountList) {
      await this.discountRepository.deleteMany({
        oid,
        discountInteractId: radiology.id,
        discountInteractType: DiscountInteractType.Radiology,
      })
      await this.discountRepository.insertMany(
        discountList.map((i) => {
          const dto: DiscountInsertType = {
            ...i,
            discountInteractId: radiology.id,
            discountInteractType: DiscountInteractType.Radiology,
            oid,
          }
          return dto
        })
      )
    }

    this.socketEmitService.socketMasterDataChange(oid, {
      radiology: true,
      position: !!positionRequestList || !!positionResultList,
      discount: !!discountList,
    })

    return { radiology }
  }

  async destroyOne(oid: number, radiologyId: number) {
    const ticketRadiologyList = await this.ticketRadiologyRepository.findMany({
      condition: { oid, radiologyId },
      limit: 10,
    })

    if (!ticketRadiologyList.length) {
      const [radiologyDestroyed, positionDestroyedList, discountDestroyedList] = await Promise.all([
        this.radiologyRepository.deleteOne({
          oid,
          id: radiologyId,
        }),,        
        this.positionRepository.deleteMany({
          oid,
          positionInteractId: radiologyId,
          positionType: { IN: [PositionType.RadiologyRequest, PositionType.RadiologyResult] },
        }),
        this.discountRepository.deleteMany({
          oid,
          discountInteractId: radiologyId,
          discountInteractType: DiscountInteractType.Radiology,
        }),
      ])

      this.socketEmitService.socketMasterDataChange(oid, {
        radiology: true,
        position: !!positionDestroyedList.length,
        discount: !!discountDestroyedList.length,
      })
    }

    return { ticketRadiologyList: [], radiologyId, success: !ticketRadiologyList.length }
  }

  async systemList() {
    const radiologySystemList = await this.radiologyRepository.findMany({
      relation: { templateHtml: true },
      condition: { oid: 1 },
      sort: { radiologyCode: 'ASC' },
    })
    return { radiologySystemList }
  }

  async systemCopy(oid: number, body: RadiologySystemCopyBody) {
    const radiologySystemList = await this.radiologyRepository.findMany({
      relation: { radiologyGroup: true },
      condition: { oid: 1, id: { IN: body.radiologyIdList } },
    })

    const groupNameList = radiologySystemList.map((i) => i.radiologyGroup?.name || '')
    const radiologyGroupList = await this.radiologyGroupService.createByGroupName(
      oid,
      groupNameList
    )
    const radiologyGroupMapName = ESArray.arrayToKeyValue(radiologyGroupList, 'name')

    let maxId = await this.radiologyRepository.getMaxId()

    const radiologyInsertList = radiologySystemList.map((i) => {
      let radiologyGroupId = 0
      const radiologyGroupName = i.radiologyGroup?.name
      if (radiologyGroupName) {
        radiologyGroupId = radiologyGroupMapName[radiologyGroupName]?.id || 0
      }

      maxId++
      const dto: RadiologyInsertType = {
        oid,
        name: i.name,
        costPrice: i.costPrice,
        price: i.price,
        templateHtmlId: i.templateHtmlId,
        radiologyGroupId,
        descriptionDefault: i.descriptionDefault,
        requestNoteDefault: i.requestNoteDefault,
        resultDefault: i.resultDefault,
        customVariables: i.customVariables,
        customStyles: i.customStyles,
        radiologyCode: maxId.toString(),
      }
      return dto
    })
    const insertIds = await this.radiologyRepository.insertManyBasic(radiologyInsertList)
    return { success: true }
  }

  async generateRelation(options: {
    oid: number
    radiologyList: Radiology[]
    relation: RadiologyRelationQuery
  }) {
    const { oid, radiologyList, relation } = options
    const radiologyIdList = ESArray.uniqueArray(radiologyList.map((i) => i.id))
    const radiologyGroupIdList = ESArray.uniqueArray(radiologyList.map((i) => i.radiologyGroupId))
    const templateHtmlIdList = ESArray.uniqueArray(radiologyList.map((i) => i.templateHtmlId))

    const [positionList, discountList, radiologyGroupList, templateHtmlList] = await Promise.all([
      relation?.positionList && radiologyIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: { IN: [PositionType.RadiologyRequest, PositionType.RadiologyResult] },
          positionInteractId: { IN: [...radiologyIdList, 0] },
        })
        : <Position[]>[],
      relation?.discountList && radiologyIdList.length
        ? this.discountRepository.findManyBy({
          oid,
          discountInteractType: DiscountInteractType.Radiology,
          discountInteractId: { IN: [...radiologyIdList, 0] }, // discountInteractId=0 là áp dụng cho tất cả
        })
        : <Discount[]>[],
      relation?.radiologyGroup && radiologyGroupIdList.length
        ? this.radiologyGroupRepository.findManyBy({
          oid,
          id: { IN: radiologyGroupIdList },
        })
        : <RadiologyGroup[]>[],
      relation?.templateHtml && templateHtmlIdList.length
        ? this.templateHtmlRepository.findManyBy({
          oid,
          id: { IN: templateHtmlIdList },
        })
        : <TemplateHtml[]>[],
    ])

    const radiologyGroupMap = ESArray.arrayToKeyValue(radiologyGroupList, 'id')
    const templateHtmlMap = ESArray.arrayToKeyValue(templateHtmlList, 'id')

    radiologyList.forEach((radiology: Radiology) => {
      if (relation?.radiologyGroup) {
        radiology.radiologyGroup = radiologyGroupMap[radiology.radiologyGroupId]
      }
      if (relation?.templateHtml) {
        radiology.templateHtml = templateHtmlMap[radiology.templateHtmlId]
      }
      if (relation?.discountList) {
        radiology.discountList = discountList.filter((i) => i.discountInteractId === radiology.id)
        radiology.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.positionList) {
        radiology.positionRequestListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.RadiologyRequest && i.positionInteractId === 0
        })
        radiology.positionRequestList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.RadiologyRequest
            && i.positionInteractId === radiology.id
          )
        })
        radiology.positionResultListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.RadiologyResult && i.positionInteractId === 0
        })
        radiology.positionResultList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.RadiologyResult && i.positionInteractId === radiology.id
          )
        })
      }
    })

    return radiologyList
  }
}
