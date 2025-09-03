import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Image,
  Procedure,
  Ticket,
  TicketProcedure,
  TicketProcedureItem,
  TicketUser,
} from '../../../../_libs/database/entities'
import { PositionType } from '../../../../_libs/database/entities/position.entity'
import {
  CustomerRepository,
  ProcedureRepository,
  TicketProcedureItemRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketProcedureRepository } from '../../../../_libs/database/repositories/ticket-procedure.repository'
import { TicketUserRepository } from '../../../../_libs/database/repositories/ticket-user.repository'
import {
  TicketProcedureGetManyQuery,
  TicketProcedureGetOneQuery,
  TicketProcedurePaginationQuery,
  TicketProcedureRelationQuery,
} from './request'

@Injectable()
export class ApiTicketProcedureService {
  constructor(
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketProcedureItemRepository: TicketProcedureItemRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketProcedurePaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketProcedureList } = await this.ticketProcedureRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        paymentMoneyStatus: filter?.paymentMoneyStatus,
        procedureId: filter?.procedureId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketProcedureList, relation })
    }

    return { ticketProcedureList, page, limit, total }
  }

  async getList(oid: number, query: TicketProcedureGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const ticketProcedureList = await this.ticketProcedureRepository.findMany({
      condition: {
        oid,
        id: filter.id,
        customerId: filter?.customerId,
        paymentMoneyStatus: filter?.paymentMoneyStatus,
        procedureId: filter?.procedureId,
        ticketId: filter?.ticketId,
      },
      limit,
      sort,
    })
    if (query.relation) {
      await this.generateRelation({ oid, ticketProcedureList, relation })
    }

    return { ticketProcedureList }
  }

  async detail(options: { oid: number; id: number; query: TicketProcedureGetOneQuery }) {
    const { oid, id, query } = options
    const relation = query.relation
    const ticketProcedure = await this.ticketProcedureRepository.findOne({
      condition: { oid, id },
    })
    if (!ticketProcedure) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (relation) {
      await this.generateRelation({
        oid,
        ticketProcedureList: [ticketProcedure],
        relation,
      })
    }

    return { ticketProcedure }
  }

  async generateRelation(object: {
    oid: number
    ticketProcedureList: TicketProcedure[]
    relation?: TicketProcedureRelationQuery
  }) {
    const { oid, ticketProcedureList, relation } = object

    const ticketProcedureIdList = ticketProcedureList.map((i) => i.id)
    const ticketIdList = ticketProcedureList.map((i) => i.ticketId)
    const customerIdList = ticketProcedureList.map((i) => i.customerId)
    const procedureIdList = ticketProcedureList.map((i) => i.procedureId)

    const [ticketList, customerList, procedureList, ticketProcedureItemList, ticketUserList] =
      await Promise.all([
        relation?.ticket && ticketIdList.length
          ? this.ticketRepository.findManyBy({
            id: { IN: ESArray.uniqueArray(ticketIdList) },
          })
          : <Ticket[]>[],
        relation?.customer && customerIdList.length
          ? this.customerRepository.findManyBy({
            id: { IN: ESArray.uniqueArray(customerIdList) },
          })
          : <Customer[]>[],
        relation?.procedure && procedureIdList.length
          ? this.procedureRepository.findManyBy({
            id: { IN: ESArray.uniqueArray(procedureIdList) },
          })
          : <Procedure[]>[],

        relation?.ticketProcedureItemList && ticketProcedureIdList.length
          ? this.ticketProcedureItemRepository.findMany({
            condition: {
              oid,
              ticketId: { IN: ESArray.uniqueArray(ticketIdList) },
              ticketProcedureId: { IN: ESArray.uniqueArray(ticketProcedureIdList) },
            },
            sort: { id: 'ASC' },
          })
          : <TicketProcedureItem[]>[],

        (relation?.ticketUserRequestList
          || relation?.ticketProcedureItemList?.ticketUserResultList)
          && ticketProcedureIdList.length
          ? this.ticketUserRepository.findManyBy({
            oid,
            ticketId: { IN: ESArray.uniqueArray(ticketIdList) },
            positionType: { IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult] },
            ticketItemId: { IN: ESArray.uniqueArray(ticketProcedureIdList) },
          })
          : <TicketUser[]>[],
      ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')

    let imageMap: Record<string, Image> = {}
    if (relation?.ticketProcedureItemList?.imageList) {
      const imageIdList: number[] = ESArray.uniqueArray(
        ticketProcedureItemList
          .map((i) => {
            try {
              return JSON.parse(i.imageIds) as number[]
            } catch (error) {
              return []
            }
          })
          .flat()
      )
      if (imageIdList.length) {
        const imageList = await this.imageRepository.findManyByIds(imageIdList)
        imageMap = ESArray.arrayToKeyValue(imageList || [], 'id')
      }
    }

    ticketProcedureList.forEach((tp: TicketProcedure) => {
      if (relation.ticket) {
        tp.ticket = ticketMap[tp.ticketId]
      }
      if (relation.customer) {
        tp.customer = customerMap[tp.customerId]
      }
      if (relation.procedure) {
        tp.procedure = procedureMap[tp.procedureId]
      }

      if (relation.ticketUserRequestList) {
        tp.ticketUserRequestList = ticketUserList.filter((ticketUser) => {
          return (
            ticketUser.ticketId === tp.ticketId
            && ticketUser.positionType === PositionType.ProcedureRequest
            && ticketUser.ticketItemId === tp.id
            && ticketUser.ticketItemChildId === 0
          )
        })
      }

      if (relation.ticketProcedureItemList) {
        tp.ticketProcedureItemList = ticketProcedureItemList.filter((i) => {
          return i.ticketProcedureId === tp.id
        })
        tp.ticketProcedureItemList.forEach((tpi) => {
          if (relation.ticketProcedureItemList.imageList) {
            try {
              const imageIdList: number[] = JSON.parse(tpi.imageIds)
              tpi.imageList = imageIdList.map((i) => imageMap[i])
            } catch (error) {
              tpi.imageList = []
            }
          }
          if (relation.ticketProcedureItemList.ticketUserResultList) {
            tpi.ticketUserResultList = ticketUserList.filter((ticketUser) => {
              return (
                ticketUser.ticketId === tpi.ticketId
                && ticketUser.positionType === PositionType.ProcedureResult
                && ticketUser.ticketItemId === tp.id 
                && ticketUser.ticketItemChildId === tpi.id 
              )
            })
          }
        })
      }
    })

    return ticketProcedureList
  }
}
