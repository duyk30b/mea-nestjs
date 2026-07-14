import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import {
  Customer,
  Room,
  Ticket,
  TicketReception,
} from '@libs/database/entities'
import {
  CustomerRepository,
  RoomRepository,
  TicketReceptionRepository,
  TicketRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import {
  TicketReceptionGetOneQuery,
  TicketReceptionPaginationQuery,
  TicketReceptionRelationQuery,
} from './request'

@Injectable()
export class TicketReceptionService {
  constructor(
    private readonly ticketReceptionRepository: TicketReceptionRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly roomRepository: RoomRepository
  ) { }

  async pagination(options: { oid: number; query: TicketReceptionPaginationQuery }) {
    const { oid, query } = options
    const { page, limit, filter, sort, relation } = query

    const { data: ticketReceptionList, total } = await this.ticketReceptionRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        ticketId: filter?.ticketId,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        receptionAt: filter?.receptionAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketReceptionList, relation })
    }

    return { ticketReceptionList, page, limit, total }
  }

  async detail(options: { oid: number; id: string; query: TicketReceptionGetOneQuery }) {
    const { oid, id, query } = options
    const relation = query.relation
    const ticketReception = await this.ticketReceptionRepository.findOne({
      condition: { oid, id },
    })
    if (!ticketReception) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (relation) {
      await this.generateRelation({
        oid,
        ticketReceptionList: [ticketReception],
        relation,
      })
    }

    return { ticketReception }
  }

  async generateRelation(object: {
    oid: number
    ticketReceptionList: TicketReception[]
    relation?: TicketReceptionRelationQuery
  }) {
    const { oid, ticketReceptionList, relation } = object

    const ticketReceptionIdList = ESArray.uniqueArray(ticketReceptionList.map((i) => i.id))
    const ticketIdList = ESArray.uniqueArray(ticketReceptionList.map((i) => i.ticketId))
    const roomIdList = ESArray.uniqueArray(ticketReceptionList.map((i) => i.roomId))
    const customerIdList = ESArray.uniqueArray(ticketReceptionList.map((i) => i.customerId))

    const dataPromise = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ oid, id: { IN: ticketIdList } })
        : <Ticket[]>[],
      relation?.room && roomIdList.length
        ? this.roomRepository.findManyBy({ oid, id: { IN: roomIdList } })
        : <Room[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ oid, id: { IN: customerIdList } })
        : <Customer[]>[],
    ])

    const ticketList: Ticket[] = dataPromise[0]
    const roomList: Room[] = dataPromise[1]
    const customerList: Customer[] = dataPromise[2]

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const roomMap = ESArray.arrayToKeyValue(roomList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')

    ticketReceptionList.forEach((reception: TicketReception) => {
      if (relation.ticket) {
        reception.ticket = ticketMap[reception.ticketId]
      }
      if (relation.room) {
        reception.room = roomMap[reception.roomId]
      }
      if (relation.customer) {
        reception.customer = customerMap[reception.customerId]
      }
    })

    return ticketReceptionList
  }
}
