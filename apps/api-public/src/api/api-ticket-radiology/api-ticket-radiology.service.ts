import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories/ticket-radiology.repository'
import {
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
} from './request'

@Injectable()
export class ApiTicketRadiologyService {
  constructor(
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketRadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { imageList, ...relationEntity } = relation // chưa xử lý imageList

    const { total, data } = await this.ticketRadiologyRepository.pagination({
      relation: relationEntity,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        radiologyId: filter?.radiologyId,
        ticketId: filter?.ticketId,
        startedAt: filter?.startedAt,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(oid: number, id: number, query: TicketRadiologyGetOneQuery): Promise<BaseResponse> {
    const { imageList, ...relationEntity } = query.relation
    const ticketRadiology = await this.ticketRadiologyRepository.findOne({
      relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketRadiology) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (imageList) {
      ticketRadiology.imageList = []
      const imageIds: number[] = JSON.parse(ticketRadiology.imageIds)
      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        imageMap = arrayToKeyValue(imageList, 'id')
      }
      imageIds.forEach((i) => {
        ticketRadiology.imageList.push(imageMap[i])
      })
    }

    return { data: { ticketRadiology } }
  }
}
