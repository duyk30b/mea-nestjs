import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketBatchRepository } from '../../../../_libs/database/repositories/ticket-batch.repository'
import { TicketBatchGetManyQuery, TicketBatchPaginationQuery } from './request'

@Injectable()
export class ApiTicketBatchService {
  constructor(private readonly ticketBatchRepository: TicketBatchRepository) { }

  async pagination(oid: number, query: TicketBatchPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketBatchList } = await this.ticketBatchRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
      },
      sort,
    })

    return { ticketBatchList, page, limit, total }
  }

  async getList(oid: number, query: TicketBatchGetManyQuery): Promise<BaseResponse> {
    const { filter, limit, relation, sort } = query

    const ticketBatchList = await this.ticketBatchRepository.findMany({
      relation,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
      },
      relationLoadStrategy: 'query',
      sort,
    })

    return { data: { ticketBatchList } }
  }
}
