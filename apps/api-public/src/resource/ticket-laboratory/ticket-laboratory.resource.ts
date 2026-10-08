import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
} from '@api-public/resource/ticket-laboratory/ticket-laboratory-get.query'
import { TicketLaboratoryRelationQuery } from '@api-public/resource/ticket-laboratory/ticket-laboratory-options.request'
import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import {
  Customer,
  Laboratory,
  LaboratoryGroup,
  Ticket,
  TicketLaboratory,
  TicketUser,
} from '@libs/database/entities'
import { PositionType } from '@libs/database/entities/position.entity'
import {
  CustomerRepository,
  LaboratoryGroupRepository,
  LaboratoryRepository,
  TicketLaboratoryRepository,
  TicketRepository,
  TicketUserRepository,
  UserRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TicketLaboratoryResource {
  constructor(
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository,
    private readonly userRepository: UserRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketRepository: TicketRepository
  ) {}

  async pagination(oid: number, query: TicketLaboratoryPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketLaboratoryList } = await this.ticketLaboratoryRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        laboratoryId: filter?.laboratoryId,
        ticketId: filter?.ticketId,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketLaboratoryList, relation: query.relation })
    }

    return { ticketLaboratoryList, page, limit, total }
  }

  async getOne(oid: number, id: string, query: TicketLaboratoryGetOneQuery) {
    const { relation } = query
    const ticketLaboratory = await this.ticketLaboratoryRepository.findOne({
      condition: { oid, id },
    })
    if (!ticketLaboratory) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (query.relation) {
      await this.generateRelation({
        oid,
        ticketLaboratoryList: [ticketLaboratory],
        relation: query.relation,
      })
    }

    return { ticketLaboratory }
  }

  async generateRelation(object: {
    oid: number
    ticketLaboratoryList: TicketLaboratory[]
    relation: TicketLaboratoryRelationQuery
  }) {
    const { oid, ticketLaboratoryList, relation } = object

    const ticketLaboratoryIdList = ESArray.uniqueArray(ticketLaboratoryList.map((i) => i.id))
    const laboratoryIdList = ESArray.uniqueArray(ticketLaboratoryList.map((i) => i.laboratoryId))
    const laboratoryGroupIdList = ESArray.uniqueArray(
      ticketLaboratoryList.map((i) => i.laboratoryGroupId)
    )
    const customerIdList = ESArray.uniqueArray(ticketLaboratoryList.map((i) => i.customerId))
    const ticketIdList = ESArray.uniqueArray(ticketLaboratoryList.map((i) => i.ticketId))

    const [laboratoryList, laboratoryGroupList, ticketList, customerList, ticketUserList] =
      await Promise.all([
        relation?.laboratory && laboratoryIdList.length
          ? this.laboratoryRepository.findManyBy({ id: { IN: laboratoryIdList } })
          : <Laboratory[]>[],
        relation?.laboratoryGroup && laboratoryGroupIdList.length
          ? this.laboratoryGroupRepository.findManyBy({ id: { IN: laboratoryGroupIdList } })
          : <LaboratoryGroup[]>[],
        relation?.ticket && ticketIdList.length
          ? this.ticketRepository.findManyBy({ id: { IN: ticketIdList } })
          : <Ticket[]>[],
        relation?.customer && customerIdList.length
          ? this.customerRepository.findManyBy({ id: { IN: customerIdList } })
          : <Customer[]>[],

        relation?.ticketUserRequestList && ticketIdList.length && ticketLaboratoryIdList.length
          ? this.ticketUserRepository.findMany({
              condition: {
                oid,
                ticketId: { IN: ticketIdList },
                positionType: PositionType.LaboratoryRequest,
                ticketItemId: { IN: ticketLaboratoryIdList },
              },
              sort: { id: 'ASC' },
            })
          : <TicketUser[]>[],
      ])

    const laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
    const laboratoryGroupMap = ESArray.arrayToKeyValue(laboratoryGroupList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')

    ticketLaboratoryList.forEach((tr: TicketLaboratory) => {
      tr.ticket = ticketMap[tr.ticketId]
      tr.customer = customerMap[tr.customerId]
      tr.laboratory = laboratoryMap[tr.laboratoryId]
      tr.laboratoryGroup = laboratoryGroupMap[tr.laboratoryGroupId]

      if (relation.ticketUserRequestList) {
        tr.ticketUserRequestList = ticketUserList.filter((tu) => {
          return tu.ticketItemId === tr.id && tu.positionType === PositionType.LaboratoryRequest
        })
      }
    })

    return ticketLaboratoryList
  }
}
