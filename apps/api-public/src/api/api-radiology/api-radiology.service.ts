import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  CommissionCalculatorType,
  CommissionInsertType,
  InteractType,
} from '../../../../_libs/database/entities/commission.entity'
import { RadiologyInsertType } from '../../../../_libs/database/entities/radiology.entity'
import {
  CommissionRepository,
  RadiologyRepository,
  TicketRadiologyRepository,
} from '../../../../_libs/database/repositories'
import {
  RadiologyGetManyQuery,
  RadiologyGetOneQuery,
  RadiologyPaginationQuery,
  RadiologySystemCopyBody,
  RadiologyUpsertBody,
} from './request'

@Injectable()
export class ApiRadiologyService {
  constructor(
    private readonly radiologyRepository: RadiologyRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async pagination(oid: number, query: RadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.radiologyRepository.pagination({
      relation: {
        printHtml: query?.relation?.printHtml,
        radiologyGroup: query?.relation?.radiologyGroup,
      },
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
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: RadiologyGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.radiologyRepository.findMany({
      relation: {
        printHtml: query?.relation?.printHtml,
        radiologyGroup: query?.relation?.radiologyGroup,
      },
      condition: {
        oid,
        radiologyGroupId: filter?.radiologyGroupId,
        printHtmlId: filter?.printHtmlId,
        updatedAt: filter?.updatedAt,
      },
      sort,
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: RadiologyGetOneQuery): Promise<BaseResponse> {
    const radiology = await this.radiologyRepository.findOne({
      relation: {
        printHtml: query?.relation?.printHtml,
        radiologyGroup: query?.relation?.radiologyGroup,
      },
      condition: { oid, id },
    })
    if (!radiology) throw new BusinessException('error.Database.NotFound')
    if (query?.relation?.commissionList) {
      radiology.commissionList = await this.commissionRepository.findManyBy({
        oid,
        interactType: InteractType.Radiology,
        interactId: radiology.id,
      })
    }
    return { data: { radiology } }
  }

  async createOne(oid: number, body: RadiologyUpsertBody): Promise<BaseResponse> {
    const { commissionList, ...radiologyBody } = body
    commissionList.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })
    const commissionDtoList: CommissionInsertType[] = commissionList.map((i) => {
      const dto: CommissionInsertType = {
        oid,
        roleId: i.roleId,
        commissionCalculatorType: i.commissionCalculatorType,
        commissionValue: i.commissionValue,
        interactId: radiology.id,
        interactType: InteractType.Radiology,
      }
      return dto
    })
    const radiology = await this.radiologyRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...radiologyBody,
    })
    radiology.commissionList =
      await this.commissionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
    return { data: { radiology } }
  }

  async updateOne(oid: number, id: number, body: RadiologyUpsertBody): Promise<BaseResponse> {
    const { commissionList, ...radiologyBody } = body
    commissionList.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })
    const [radiology] = await this.radiologyRepository.updateAndReturnEntity(
      { oid, id },
      radiologyBody
    )
    if (!radiology) throw new BusinessException('error.Database.UpdateFailed')
    await this.commissionRepository.delete({
      oid,
      interactId: radiology.id,
      interactType: InteractType.Radiology,
    })
    const commissionDtoList: CommissionInsertType[] = commissionList.map((i) => {
      const dto: CommissionInsertType = {
        oid,
        roleId: i.roleId,
        commissionCalculatorType: i.commissionCalculatorType,
        commissionValue: i.commissionValue,
        interactId: radiology.id,
        interactType: InteractType.Radiology,
      }
      return dto
    })
    radiology.commissionList =
      await this.commissionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
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

    await this.commissionRepository.delete({
      oid,
      interactId: radiologyId,
      interactType: InteractType.Radiology,
    })
    const affected = await this.radiologyRepository.delete({ oid, id: radiologyId })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: { ticketRadiologyList: [], radiologyId } }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.radiologyRepository.findMany({
      relation: { printHtml: true },
      condition: { oid: 1 },
      sort: { priority: 'ASC' },
    })
    return { data }
  }

  async systemCopy(oid: number, body: RadiologySystemCopyBody): Promise<BaseResponse> {
    const radiologySystemList = await this.radiologyRepository.findMany({
      condition: { oid: 1, id: { IN: body.radiologyIdList } },
    })
    const radiologyInsertList = radiologySystemList.map((i) => {
      const dto: RadiologyInsertType = {
        oid,
        name: i.name,
        costPrice: i.costPrice,
        price: i.price,
        printHtmlId: i.printHtmlId,
        radiologyGroupId: 0,
        descriptionDefault: i.descriptionDefault,
        requestNoteDefault: i.requestNoteDefault,
        resultDefault: i.resultDefault,
        priority: 0, // cập nhật sau
      }
      return dto
    })
    const insertIds = await this.radiologyRepository.insertMany(radiologyInsertList)
    await this.radiologyRepository.update({ id: { IN: insertIds } }, { priority: () => `"id"` })
    return { data: true }
  }
}
