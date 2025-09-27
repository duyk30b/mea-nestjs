import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import {
  Customer,
  CustomerSource,
  Room,
  Ticket,
  TicketReception,
} from '../../../../_libs/database/entities'
import {
  CustomerRepository,
  CustomerSourceRepository,
  RoomRepository,
  TicketReceptionRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
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
    private readonly customerSourceRepository: CustomerSourceRepository,
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
        customerSourceId: filter?.customerSourceId,
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
    const customerSourceIdList = ESArray.uniqueArray(
      ticketReceptionList.map((i) => i.customerSourceId)
    )

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
      relation?.customerSource && customerSourceIdList.length
        ? this.customerSourceRepository.findManyBy({ oid, id: { IN: customerSourceIdList } })
        : <CustomerSource[]>[],
    ])

    const ticketList: Ticket[] = dataPromise[0]
    const roomList: Room[] = dataPromise[1]
    const customerList: Customer[] = dataPromise[2]
    const customerSourceList: CustomerSource[] = dataPromise[3]

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const roomMap = ESArray.arrayToKeyValue(roomList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const customerSourceMap = ESArray.arrayToKeyValue(customerSourceList, 'id')

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
      if (relation.customerSource) {
        reception.customerSource = customerSourceMap[reception.customerSourceId]
      }
    })

    return ticketReceptionList
  }
}
