import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketProcedureRepository } from '../../../../_libs/database/repository/ticket-procedure/ticket-procedure.repository'
import { TicketProcedurePaginationQuery } from './request'

@Injectable()
export class ApiTicketProcedureService {
  constructor(private readonly ticketProcedureRepository: TicketProcedureRepository) {}

  async pagination(oid: number, query: TicketProcedurePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.ticketProcedureRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        procedureId: filter?.procedureId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }
}
