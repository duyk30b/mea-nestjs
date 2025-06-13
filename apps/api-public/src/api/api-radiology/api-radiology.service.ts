import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Discount, PrintHtml, RadiologyGroup } from '../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  CommissionCalculatorType,
  PositionInsertType,
  PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import Radiology, {
  RadiologyInsertType,
} from '../../../../_libs/database/entities/radiology.entity'
import {
  DiscountRepository,
  PositionRepository,
  PrintHtmlRepository,
  RadiologyGroupRepository,
  RadiologyRepository,
  TicketRadiologyRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ApiRadiologyGroupService } from '../api-radiology-group/api-radiology-group.service'
import {
  RadiologyGetManyQuery,
  RadiologyGetOneQuery,
  RadiologyPaginationQuery,
  RadiologyRelationQuery,
  RadiologySystemCopyBody,
  RadiologyUpsertBody,
} from './request'

@Injectable()
export class ApiRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly radiologyGroupRepository: RadiologyGroupRepository,
    private readonly printHtmlRepository: PrintHtmlRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly apiRadiologyGroupService: ApiRadiologyGroupService
  ) { }

  async pagination(oid: number, query: RadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.radiologyRepository.pagination({
      // relation: {
      //   printHtml: query?.relation?.printHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      page,
      limit,
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        printHtmlId: filter?.printHtmlId,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, radiologyList: data, relation: query.relation })
    }
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: RadiologyGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.radiologyRepository.findMany({
      // relation: {
      //   printHtml: query?.relation?.printHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        printHtmlId: filter?.printHtmlId,
        updatedAt: filter?.updatedAt,
      },
      sort,
      limit,
    })
    if (query.relation) {
      await this.generateRelation({ oid, radiologyList: data, relation: query.relation })
    }
    return { data }
  }

  async getOne(oid: number, id: number, query: RadiologyGetOneQuery): Promise<BaseResponse> {
    const radiology = await this.radiologyRepository.findOne({
      // relation: {
      //   printHtml: query?.relation?.printHtml,
      //   radiologyGroup: query?.relation?.radiologyGroup,
      // },
      condition: { oid, id },
    })
    if (!radiology) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation({ oid, radiologyList: [radiology], relation: query.relation })
    }

    return { data: { radiology } }
  }

  async createOne(oid: number, body: RadiologyUpsertBody): Promise<BaseResponse> {
    const { positionList, radiology: radiologyBody, discountList } = body
    positionList?.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })

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

    const radiology = await this.radiologyRepository.insertOneFullFieldAndReturnEntity({
      ...radiologyBody,
      oid,
      radiologyCode,
    })
    this.socketEmitService.radiologyListChange(oid, { radiologyUpsertedList: [radiology] })

    if (positionList?.length) {
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: radiology.id,
          positionType: PositionInteractType.Radiology,
        }
        return dto
      })

      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      radiology.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, { positionUpsertedList })
    }

    if (discountList?.length) {
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: radiology.id,
          discountInteractType: DiscountInteractType.Radiology,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      radiology.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, { discountUpsertedList })
    }

    return { data: { radiology } }
  }

  async updateOne(
    oid: number,
    radiologyId: number,
    body: RadiologyUpsertBody
  ): Promise<BaseResponse> {
    const { positionList, radiology: radiologyBody, discountList } = body
    positionList?.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })

    const existRadiology = await this.radiologyRepository.findOneBy({
      oid,
      radiologyCode: radiologyBody.radiologyCode,
      id: { NOT: radiologyId },
    })
    if (existRadiology) {
      throw new BusinessException(`Trùng mã sản phẩm với ${existRadiology.name}` as any)
    }

    const radiology = await this.radiologyRepository.updateOneAndReturnEntity(
      { oid, id: radiologyId },
      radiologyBody
    )
    this.socketEmitService.radiologyListChange(oid, { radiologyUpsertedList: [radiology] })
    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: radiology.id,
        positionType: PositionInteractType.Radiology,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: radiology.id,
          positionType: PositionInteractType.Radiology,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      radiology.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: radiology.id,
        discountInteractType: DiscountInteractType.Radiology,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: radiology.id,
          discountInteractType: DiscountInteractType.Radiology,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      radiology.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }

    return { data: { radiology } }
  }

  async destroyOne(oid: number, radiologyId: number): Promise<BaseResponse> {
    const ticketRadiologyList = await this.ticketRadiologyRepository.findMany({
      condition: { oid, radiologyId },
      limit: 10,
    })
    if (ticketRadiologyList.length > 0) {
      return {
        data: { ticketRadiologyList },
        success: false,
      }
    }

    const [positionDestroyedList, discountDestroyedList] = await Promise.all([
      this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: radiologyId,
        positionType: PositionInteractType.Radiology,
      }),
      this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: radiologyId,
        discountInteractType: DiscountInteractType.Radiology,
      }),
    ])

    if (positionDestroyedList.length) {
      this.socketEmitService.positionListChange(oid, { positionDestroyedList })
    }

    if (discountDestroyedList.length) {
      this.socketEmitService.discountListChange(oid, { discountDestroyedList })
    }

    const radiology = await this.radiologyRepository.deleteOneAndReturnEntity({
      oid,
      id: radiologyId,
    })
    this.socketEmitService.radiologyListChange(oid, { radiologyDestroyedList: [radiology] })

    return { data: { ticketRadiologyList: [], radiologyId } }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.radiologyRepository.findMany({
      relation: { printHtml: true },
      condition: { oid: 1 },
      sort: { radiologyCode: 'ASC' },
    })
    return { data }
  }

  async systemCopy(oid: number, body: RadiologySystemCopyBody): Promise<BaseResponse> {
    const radiologySystemList = await this.radiologyRepository.findMany({
      relation: { radiologyGroup: true },
      condition: { oid: 1, id: { IN: body.radiologyIdList } },
    })

    const groupNameList = radiologySystemList.map((i) => i.radiologyGroup?.name || '')
    const radiologyGroupList = await this.apiRadiologyGroupService.createByGroupName(
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
        printHtmlId: i.printHtmlId,
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
    const insertIds = await this.radiologyRepository.insertMany(radiologyInsertList)
    return { data: true }
  }

  async generateRelation(options: {
    oid: number
    radiologyList: Radiology[]
    relation: RadiologyRelationQuery
  }) {
    const { oid, radiologyList, relation } = options
    const radiologyIdList = ESArray.uniqueArray(radiologyList.map((i) => i.id))
    const radiologyGroupIdList = ESArray.uniqueArray(radiologyList.map((i) => i.radiologyGroupId))
    const printHtmlIdList = ESArray.uniqueArray(radiologyList.map((i) => i.printHtmlId))

    const [positionList, discountList, radiologyGroupList, printHtmlList] = await Promise.all([
      relation?.positionList && radiologyIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: PositionInteractType.Radiology,
          positionInteractId: { IN: radiologyIdList },
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
      relation?.printHtml && printHtmlIdList.length
        ? this.printHtmlRepository.findManyBy({
          oid,
          id: { IN: printHtmlIdList },
        })
        : <PrintHtml[]>[],
    ])

    const radiologyGroupMap = ESArray.arrayToKeyValue(radiologyGroupList, 'id')
    const printHtmlMap = ESArray.arrayToKeyValue(printHtmlList, 'id')

    radiologyList.forEach((radiology: Radiology) => {
      if (relation?.positionList) {
        radiology.positionList = positionList.filter((i) => i.positionInteractId === radiology.id)
      }
      if (relation?.discountList) {
        radiology.discountList = discountList.filter((i) => i.discountInteractId === radiology.id)
        radiology.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.radiologyGroup) {
        radiology.radiologyGroup = radiologyGroupMap[radiology.radiologyGroupId]
      }
      if (relation?.printHtml) {
        radiology.printHtml = printHtmlMap[radiology.printHtmlId]
      }
    })

    return radiologyList
  }
}
