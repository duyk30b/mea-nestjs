import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryStatus,
} from '../../../../_libs/database/entities/ticket-laboratory.entity'
import { LaboratoryRepository } from '../../../../_libs/database/repository/laboratory/laboratory.repository'
import { TicketLaboratoryRepository } from '../../../../_libs/database/repository/ticket-laboratory/ticket-laboratory.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
  TicketLaboratoryUpdateResultBody,
} from './request'

@Injectable()
export class ApiTicketLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: TicketLaboratoryPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.ticketLaboratoryRepository.pagination({
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
        laboratoryList: relation?.laboratoryList,
      },
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        laboratoryId: filter?.laboratoryId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(oid: number, id: number, query: TicketLaboratoryGetOneQuery): Promise<BaseResponse> {
    const { relation } = query
    const ticketLaboratory = await this.ticketLaboratoryRepository.findOne({
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
        laboratoryList: relation?.laboratoryList,
      },
      condition: { oid, id },
    })
    if (!ticketLaboratory) {
      throw new BusinessException('error.Database.NotFound')
    }

    return { data: { ticketLaboratory } }
  }

  async updateResult(options: { oid: number; body: TicketLaboratoryUpdateResultBody }) {
    const { oid, body } = options

    if (body.ticketLaboratoryUpdateList.length) {
      await this.ticketLaboratoryRepository.updateResultList({
        oid,
        ticketId: body.ticketId,
        startedAt: body.startedAt,
        ticketLaboratoryDtoList: body.ticketLaboratoryUpdateList,
      })
    }
    if (body.ticketLaboratoryCreateList.length) {
      const ticketLaboratoryDtoList = body.ticketLaboratoryCreateList.map((i) => {
        const insert: TicketLaboratoryInsertType = {
          ...i,
          oid,
          ticketId: body.ticketId,
          customerId: body.customerId,
          status: TicketLaboratoryStatus.Completed,
          startedAt: body.startedAt,
        }
        return insert
      })
      await this.ticketLaboratoryRepository.insertManyFullField(ticketLaboratoryDtoList)
    }
    const ticketLaboratoryList = await this.ticketLaboratoryRepository.findMany({
      condition: {
        oid,
        ticketId: body.ticketId,
      },
      sort: { id: 'ASC' },
    })

    if (body.ticketLaboratoryCreateList.length) {
      const laboratoryMoney = ticketLaboratoryList.reduce((acc, cur) => acc + cur.actualPrice, 0)
      const [ticket] = await this.ticketRepository.changeLaboratoryMoney({
        oid,
        ticketId: body.ticketId,
        laboratoryMoney,
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic: ticket })
    }

    this.socketEmitService.ticketClinicUpdateTicketLaboratoryList(oid, {
      ticketId: body.ticketId,
      ticketLaboratoryList,
    })
    return { data: { ticketId: body.ticketId } }
  }

  async cancelResult(oid: number, id: number) {
    const [ticketLaboratory] = await this.ticketLaboratoryRepository.updateAndReturnEntity(
      { oid, id },
      {
        startedAt: null,
        status: TicketLaboratoryStatus.Pending,
        result: JSON.stringify({}),
        attention: JSON.stringify({}),
      }
    )

    this.socketEmitService.ticketClinicUpdateTicketLaboratoryResult(oid, {
      ticketId: ticketLaboratory.ticketId,
      ticketLaboratory,
    })
    return { data: { ticketId: ticketLaboratory.ticketId } }
  }
}
