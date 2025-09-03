import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Image,
  Ticket,
  TicketRadiology,
  TicketUser,
} from '../../../../_libs/database/entities'
import { PositionType } from '../../../../_libs/database/entities/position.entity'
import {
  CustomerRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories/ticket-radiology.repository'
import {
  TicketRadiologyGetManyQuery,
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

  async pagination(oid: number, query: TicketRadiologyPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { data: ticketRadiologyList, total } = await this.ticketRadiologyRepository.pagination({
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
        createdAt: filter?.createdAt,
        completedAt: filter?.completedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketRadiologyList, relation: query.relation })
    }

    return { ticketRadiologyList, page, limit, total }
  }

  async getOne(oid: number, id: number, query: TicketRadiologyGetOneQuery) {
    const ticketRadiology = await this.ticketRadiologyRepository.findOne({
      // relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketRadiology) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (query.relation) {
      await this.generateRelation({
        oid,
        ticketRadiologyList: [ticketRadiology],
        relation: query.relation,
      })
    }

    return { ticketRadiology }
  }

  async getList(oid: number, query: TicketRadiologyGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const ticketRadiologyList = await this.ticketRadiologyRepository.findMany({
      condition: {
        oid,
        id: filter.id,
        ticketId: filter?.ticketId,
        customerId: filter?.customerId,
        radiologyId: filter?.radiologyId,
        roomId: filter?.roomId,
        status: filter?.status,
        paymentMoneyStatus: filter?.paymentMoneyStatus,

        createdAt: filter?.createdAt,
        completedAt: filter?.completedAt,
      },
      limit,
      sort,
    })
    if (query.relation) {
      await this.generateRelation({ oid, ticketRadiologyList, relation })
    }

    return { ticketRadiologyList }
  }

  async generateRelation(object: {
    oid: number
    ticketRadiologyList: TicketRadiology[]
    relation: TicketRadiologyRelationQuery
  }) {
    const { oid, ticketRadiologyList, relation } = object

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

      (relation?.ticketUserRequestList || relation?.ticketUserResultList)
        && ticketIdList.length
        && ticketRadiologyIdList.length
        ? this.ticketUserRepository.findMany({
          condition: {
            oid,
            ticketId: { IN: ticketIdList },
            positionType: PositionType.RadiologyRequest,
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

      if (relation.ticketUserRequestList) {
        tr.ticketUserRequestList = ticketUserList.filter((tu) => {
          return tu.ticketItemId === tr.id && tu.positionType === PositionType.RadiologyRequest
        })
      }
      if (relation.ticketUserResultList) {
        tr.ticketUserResultList = ticketUserList.filter((tu) => {
          return tu.ticketItemId === tr.id && tu.positionType === PositionType.RadiologyResult
        })
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
