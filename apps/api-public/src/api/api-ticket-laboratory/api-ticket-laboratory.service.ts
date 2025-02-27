import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketRepository } from '../../../../_libs/database/repositories'
import { LaboratoryRepository } from '../../../../_libs/database/repositories/laboratory.repository'
import { TicketLaboratoryRepository } from '../../../../_libs/database/repositories/ticket-laboratory.repository'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketLaboratoryGetOneQuery, TicketLaboratoryPaginationQuery } from './request'

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
        startedAt: filter?.startedAt,
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
}
