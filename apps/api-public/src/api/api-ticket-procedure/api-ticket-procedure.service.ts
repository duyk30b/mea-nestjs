import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Image } from '../../../../_libs/database/entities'
import { InteractType } from '../../../../_libs/database/entities/commission.entity'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketProcedureRepository } from '../../../../_libs/database/repositories/ticket-procedure.repository'
import { TicketUserRepository } from '../../../../_libs/database/repositories/ticket-user.repository'
import { TicketProcedureGetOneQuery, TicketProcedurePaginationQuery } from './request'

@Injectable()
export class ApiTicketProcedureService {
  constructor(
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketProcedurePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { imageList, ticketUser, ...relationEntity } = relation // chưa xử lý imageList và ticketUser

    const { total, data } = await this.ticketProcedureRepository.pagination({
      relation: relationEntity,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        procedureId: filter?.procedureId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(oid: number, id: number, query: TicketProcedureGetOneQuery): Promise<BaseResponse> {
    const { imageList, ticketUser, ...relationEntity } = query.relation
    const ticketProcedure = await this.ticketProcedureRepository.findOne({
      relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketProcedure) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (imageList) {
      ticketProcedure.imageList = []
      const imageIds: number[] = JSON.parse(ticketProcedure.imageIds)
      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        imageMap = arrayToKeyValue(imageList, 'id')
      }
      imageIds.forEach((i) => {
        ticketProcedure.imageList.push(imageMap[i])
      })
    }

    if (ticketUser) {
      ticketProcedure.ticketUserList = await this.ticketUserRepository.findManyBy({
        oid,
        ticketId: ticketProcedure.ticketId,
        interactType: InteractType.Procedure,
        interactId: ticketProcedure.id,
      })
    }

    return { data: { ticketProcedure } }
  }
}
