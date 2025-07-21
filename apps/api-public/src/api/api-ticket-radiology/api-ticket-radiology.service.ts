import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import {
  Customer,
  Image,
  Ticket,
  TicketRadiology,
  TicketUser,
} from '../../../../_libs/database/entities'
import { PositionInteractType } from '../../../../_libs/database/entities/position.entity'
import {
  CustomerRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories/ticket-radiology.repository'
import {
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
  TicketRadiologyRelationQuery,
} from './request'

@Injectable()
export class ApiTicketRadiologyService {
  constructor(
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketRadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.ticketRadiologyRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        status: filter?.status,
        paymentMoneyStatus: filter?.paymentMoneyStatus,
        radiologyId: filter?.radiologyId,
        ticketId: filter?.ticketId,
        startedAt: filter?.startedAt,
        registeredAt: filter?.registeredAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation(data, query.relation)
    }

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(oid: number, id: number, query: TicketRadiologyGetOneQuery): Promise<BaseResponse> {
    const ticketRadiology = await this.ticketRadiologyRepository.findOne({
      // relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketRadiology) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (query.relation) {
      await this.generateRelation([ticketRadiology], query.relation)
    }

    return { data: { ticketRadiology } }
  }

  async generateRelation(
    ticketRadiologyList: TicketRadiology[],
    relation: TicketRadiologyRelationQuery
  ) {
    const ticketRadiologyIdList = ESArray.uniqueArray(ticketRadiologyList.map((i) => i.id))
    const customerIdList = ESArray.uniqueArray(ticketRadiologyList.map((i) => i.customerId))
    const ticketIdList = ESArray.uniqueArray(ticketRadiologyList.map((i) => i.ticketId))
    const imageIdList: number[] = ESArray.uniqueArray(
      ticketRadiologyList.map((i) => JSON.parse(i.imageIds) as number[]).flat()
    )

    const [ticketList, customerList, ticketUserList, imageList] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ id: { IN: ticketIdList } })
        : <Ticket[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ id: { IN: customerIdList } })
        : <Customer[]>[],

      relation?.ticketUserList && ticketIdList.length && ticketRadiologyIdList.length
        ? this.ticketUserRepository.findMany({
          condition: {
            ticketId: { IN: ticketIdList },
            positionType: PositionInteractType.Radiology,
            ticketItemId: { IN: ticketRadiologyIdList },
          },
          sort: { id: 'ASC' },
        })
        : <TicketUser[]>[],
      relation?.imageList && imageIdList.length
        ? this.imageRepository.findManyByIds(imageIdList)
        : <Image[]>[],
    ])
    const imageMap = ESArray.arrayToKeyValue(imageList, 'id')

    ticketRadiologyList.forEach((tr: TicketRadiology) => {
      tr.ticket = ticketList.find((t) => t.id === tr.ticketId)
      tr.customer = customerList.find((c) => c.id === tr.customerId)

      if (relation.ticketUserList) {
        tr.ticketUserList = ticketUserList.filter((tu) => tu.ticketItemId === tr.id)
      }

      if (relation.imageList) {
        tr.imageList = []
        const imageIds: number[] = JSON.parse(tr.imageIds)
        tr.imageList = imageIds.map((i) => imageMap[i])
      }
    })

    return ticketRadiologyList
  }
}
