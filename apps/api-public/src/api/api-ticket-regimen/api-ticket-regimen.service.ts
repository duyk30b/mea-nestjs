import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Regimen,
  Ticket,
  TicketProcedure,
  TicketRegimen,
  TicketUser,
} from '../../../../_libs/database/entities'
import { PositionType } from '../../../../_libs/database/entities/position.entity'
import { TicketProcedureType } from '../../../../_libs/database/entities/ticket-procedure.entity'
import {
  CustomerRepository,
  RegimenRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { TicketRegimenRepository } from '../../../../_libs/database/repositories/ticket-regimen.repository'
import { TicketUserRepository } from '../../../../_libs/database/repositories/ticket-user.repository'
import { ApiTicketProcedureService } from '../api-ticket-procedure/api-ticket-procedure.service'
import {
  TicketRegimenGetManyQuery,
  TicketRegimenGetOneQuery,
  TicketRegimenPaginationQuery,
  TicketRegimenRelationQuery,
} from './request'

@Injectable()
export class ApiTicketRegimenService {
  constructor(
    private readonly ticketRegimenRepository: TicketRegimenRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly regimenRepository: RegimenRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly apiTicketProcedureService: ApiTicketProcedureService
  ) { }

  async pagination(oid: number, query: TicketRegimenPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketRegimenList } = await this.ticketRegimenRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        regimenId: filter?.regimenId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketRegimenList, relation })
    }

    return { ticketRegimenList, page, limit, total }
  }

  async getList(oid: number, query: TicketRegimenGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const ticketRegimenList = await this.ticketRegimenRepository.findMany({
      condition: {
        oid,
        id: filter.id,
        customerId: filter?.customerId,
        regimenId: filter?.regimenId,
        ticketId: filter?.ticketId,
      },
      limit,
      sort,
    })
    if (query.relation) {
      await this.generateRelation({ oid, ticketRegimenList, relation })
    }

    return { ticketRegimenList }
  }

  async detail(options: { oid: number; id: string; query: TicketRegimenGetOneQuery }) {
    const { oid, id, query } = options
    const relation = query.relation
    const ticketRegimen = await this.ticketRegimenRepository.findOne({
      condition: { oid, id },
    })
    if (!ticketRegimen) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (relation) {
      await this.generateRelation({
        oid,
        ticketRegimenList: [ticketRegimen],
        relation,
      })
    }

    return { ticketRegimen }
  }

  async generateRelation(object: {
    oid: number
    ticketRegimenList: TicketRegimen[]
    relation?: TicketRegimenRelationQuery
  }) {
    const { oid, ticketRegimenList, relation } = object

    const ticketRegimenIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.id))
    const ticketIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.ticketId))
    const customerIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.customerId))
    const regimenIdList = ESArray.uniqueArray(ticketRegimenList.map((i) => i.regimenId))

    const dataPromise = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ oid, id: { IN: ticketIdList } })
        : <Ticket[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ oid, id: { IN: customerIdList } })
        : <Customer[]>[],
      relation?.regimen && regimenIdList.length
        ? this.regimenRepository.findManyBy({ oid, id: { IN: regimenIdList } })
        : <Regimen[]>[],

      relation?.ticketUserRequestList && ticketRegimenIdList.length
        ? this.ticketUserRepository.findManyBy({
          oid,
          ticketId: { IN: ESArray.uniqueArray(ticketIdList) },
          positionType: { IN: [PositionType.RegimenRequest] },
          ticketItemId: { IN: ticketRegimenIdList },
        })
        : <TicketUser[]>[],
      relation?.ticketProcedureList && ticketRegimenIdList.length
        ? this.apiTicketProcedureService.getList(oid, {
          relation: {
            imageList: true,
            ticketUserResultList: true,
          },
          filter: {
            oid,
            customerId: { IN: customerIdList },
            ticketRegimenId: { IN: ticketRegimenIdList },
            ticketProcedureType: TicketProcedureType.InRegimen,
            // ticketId: { IN: ticketIdList }, // ticketProcedure có thể gắn với bất kỳ ticketId nào sử dụng nó
          },
          sort: { completedAt: 'ASC', id: 'ASC' },
        })
        : undefined,
    ])

    const ticketList: Ticket[] = dataPromise[0]
    const customerList: Customer[] = dataPromise[1]
    const regimenList: Regimen[] = dataPromise[2]
    const ticketUserRequestList: TicketUser[] = dataPromise[3]
    const ticketProcedureList: TicketProcedure[] = dataPromise[4]?.ticketProcedureList || []

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const regimenMap = ESArray.arrayToKeyValue(regimenList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')

    ticketRegimenList.forEach((ticketRegimen: TicketRegimen) => {
      if (relation.ticket) {
        ticketRegimen.ticket = ticketMap[ticketRegimen.ticketId]
      }
      if (relation.customer) {
        ticketRegimen.customer = customerMap[ticketRegimen.customerId]
      }
      if (relation.regimen) {
        ticketRegimen.regimen = regimenMap[ticketRegimen.regimenId]
      }

      if (relation.ticketUserRequestList) {
        ticketRegimen.ticketUserRequestList = ticketUserRequestList.filter((tu) => {
          return (
            tu.ticketId === ticketRegimen.ticketId
            && tu.positionType === PositionType.RegimenRequest
            && tu.ticketItemId === ticketRegimen.id
          )
        })
      }

      if (relation.ticketProcedureList) {
        ticketRegimen.ticketProcedureList = ticketProcedureList.filter((tp) => {
          return tp.ticketRegimenId === ticketRegimen.id
        })
      }
    })

    return ticketRegimenList
  }
}
