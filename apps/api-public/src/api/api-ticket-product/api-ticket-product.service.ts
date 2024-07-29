import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { TicketProductPaginationQuery } from './request'

@Injectable()
export class ApiTicketProductService {
  constructor(private readonly ticketProductRepository: TicketProductRepository) {}

  async pagination(oid: number, query: TicketProductPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.ticketProductRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        batchId: filter?.batchId,
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
