import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import {
  Customer,
  Ticket,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketUser,
} from '../../../../_libs/database/entities'
import { PositionType } from '../../../../_libs/database/entities/position.entity'
import {
  CustomerRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import {
  TicketLaboratoryGroupGetOneQuery,
  TicketLaboratoryGroupPaginationQuery,
  TicketLaboratoryGroupRelationQuery,
} from './request'

@Injectable()
export class ApiTicketLaboratoryGroupService {
  constructor(
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: TicketLaboratoryGroupPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketLaboratoryGroupList } =
      await this.ticketLaboratoryGroupRepository.pagination({
        // relation: {
        //   customer: relation?.customer,
        //   ticket: relation?.ticket,
        // },
        page,
        limit,
        condition: {
          oid,
          status: filter?.status,
          paymentMoneyStatus: filter?.paymentMoneyStatus,
          customerId: filter?.customerId,
          roomId: filter?.roomId,
          ticketId: filter?.ticketId,
          createdAt: filter?.createdAt,
          completedAt: filter?.completedAt,
        },
        sort,
      })

    if (query.relation) {
      await this.generateRelation(ticketLaboratoryGroupList, query.relation)
    }

    return { ticketLaboratoryGroupList, page, limit, total }
  }

  async getOne(oid: number, id: string, query: TicketLaboratoryGroupGetOneQuery) {
    const { relation } = query
    const ticketLaboratoryGroup = await this.ticketLaboratoryGroupRepository.findOne({
      // relation: {
      //   customer: relation?.customer,
      //   ticket: relation?.ticket,
      // },
      condition: { oid, id },
    })
    if (!ticketLaboratoryGroup) {
      throw new BusinessException('error.Database.NotFound')
    }
    if (query.relation) {
      await this.generateRelation([ticketLaboratoryGroup], query.relation)
    }

    return { ticketLaboratoryGroup }
  }

  async generateRelation(
    ticketLaboratoryGroupList: TicketLaboratoryGroup[],
    relation: TicketLaboratoryGroupRelationQuery
  ) {
    const tlgIdList = ESArray.uniqueArray(ticketLaboratoryGroupList.map((i) => i.id))
    const customerIdList = ESArray.uniqueArray(ticketLaboratoryGroupList.map((i) => i.customerId))
    const ticketIdList = ESArray.uniqueArray(ticketLaboratoryGroupList.map((i) => i.ticketId))

    const [
      ticketList,
      customerList,
      ticketUserList,
      ticketLaboratoryList,
      ticketLaboratoryResultList,
    ] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ id: { IN: ticketIdList } })
        : <Ticket[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ id: { IN: customerIdList } })
        : <Customer[]>[],

      relation?.ticketUserList && ticketIdList.length && tlgIdList.length
        ? this.ticketUserRepository.findMany({
          condition: {
            ticketId: { IN: ticketIdList },
            positionType: PositionType.LaboratoryGroupRequest,
            ticketItemId: { IN: tlgIdList },
          },
          sort: { id: 'ASC' },
        })
        : <TicketUser[]>[],
      relation?.ticketLaboratoryList && ticketIdList.length && tlgIdList.length
        ? this.ticketLaboratoryRepository.findMany({
          condition: {
            ticketId: { IN: ticketIdList },
            ticketLaboratoryGroupId: { IN: tlgIdList },
          },
          sort: { id: 'ASC' },
        })
        : <TicketLaboratory[]>[],
      relation?.ticketLaboratoryResultMap && ticketIdList.length && tlgIdList.length
        ? this.ticketLaboratoryResultRepository.findManyBy({
          ticketId: { IN: ticketIdList },
          ticketLaboratoryGroupId: { IN: tlgIdList },
        })
        : <TicketLaboratoryResult[]>[],
    ])

    ticketLaboratoryGroupList.forEach((tlg: TicketLaboratoryGroup) => {
      tlg.ticket = ticketList.find((t) => t.id === tlg.ticketId)
      tlg.customer = customerList.find((c) => c.id === tlg.customerId)

      if (relation.ticketUserList) {
        tlg.ticketUserList = ticketUserList.filter((tu) => tu.ticketItemId === tlg.id)
      }
      if (relation.ticketLaboratoryList) {
        tlg.ticketLaboratoryList = ticketLaboratoryList.filter((tl) => {
          return tl.ticketLaboratoryGroupId === tlg.id
        })
      }
      if (relation.ticketLaboratoryResultMap) {
        tlg.ticketLaboratoryResultMap = ESArray.arrayToKeyValue(
          ticketLaboratoryResultList,
          'laboratoryId'
        )
      }
    })

    return ticketLaboratoryGroupList
  }
}
