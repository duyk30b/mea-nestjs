import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RadiologyInsertType } from '../../../../_libs/database/entities/radiology.entity'
import { RadiologyRepository, TicketRadiologyRepository } from '../../../../_libs/database/repositories'
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
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async pagination(oid: number, query: RadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.radiologyRepository.pagination({
      relation,
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
      relation,
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
      relation: query?.relation,
      condition: { oid, id },
    })
    if (!radiology) throw new BusinessException('error.Database.NotFound')
    return { data: { radiology } }
  }

  async createOne(oid: number, body: RadiologyUpsertBody): Promise<BaseResponse> {
    const radiology = await this.radiologyRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })

    return { data: { radiology } }
  }

  async updateOne(oid: number, id: number, body: RadiologyUpsertBody): Promise<BaseResponse> {
    const [radiology] = await this.radiologyRepository.updateAndReturnEntity({ oid, id }, body)
    if (!radiology) throw new BusinessException('error.Database.UpdateFailed')

    return { data: { radiology } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const ticketRadiologyList = await this.ticketRadiologyRepository.findMany({
      condition: { oid, radiologyId: id },
      limit: 10,
    })
    if (ticketRadiologyList.length > 0) {
      return {
        data: { ticketRadiologyList },
        success: false,
      }
    }
    const affected = await this.radiologyRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: { ticketRadiologyList: [], radiologyId: id } }
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
