import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Ticket,
  TicketRegimen,
} from '../../../../_libs/database/entities'
import {
  CustomerRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { TicketRegimenRepository } from '../../../../_libs/database/repositories/ticket-regimen.repository'
import {
  TicketRegimenGetOneQuery,
  TicketRegimenPaginationQuery,
  TicketRegimenRelationQuery,
} from './request'

@Injectable()
export class ApiTicketRegimenService {
  constructor(
    private readonly ticketRegimenRepository: TicketRegimenRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: TicketRegimenPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.ticketRegimenRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        status: filter?.status,
        paymentMoneyStatus: filter?.paymentMoneyStatus,
        regimenId: filter?.regimenId,
        customerId: filter?.customerId,
        ticketId: filter?.ticketId,
        registeredAt: filter?.registeredAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation(data, query.relation)
    }

    return { ticketRegimenList: data, page, limit, total }
  }

  async getOne(oid: number, id: number, query: TicketRegimenGetOneQuery) {
    const ticketRegimen = await this.ticketRegimenRepository.findOne({
      // relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketRegimen) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (query.relation) {
      await this.generateRelation([ticketRegimen], query.relation)
    }

    return { data: { ticketRegimen } }
  }

  async generateRelation(ticketRegimenList: TicketRegimen[], relation: TicketRegimenRelationQuery) {
    const ticketRegimenIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.id))
    const customerIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.customerId))
    const ticketIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.ticketId))

    const [ticketList, customerList] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ id: { IN: ticketIdList } })
        : <Ticket[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ id: { IN: customerIdList } })
        : <Customer[]>[],
    ])

    ticketRegimenList.forEach((tr: TicketRegimen) => {
      tr.ticket = ticketList.find((t) => t.id === tr.ticketId)
      tr.customer = customerList.find((c) => c.id === tr.customerId)
    })

    return ticketRegimenList
  }
}
