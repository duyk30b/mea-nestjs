import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketProductRepository } from '../../../../_libs/database/repositories/ticket-product.repository'
import { TicketProductGetManyQuery, TicketProductPaginationQuery } from './request'

@Injectable()
export class ApiTicketProductService {
  constructor(private readonly ticketProductRepository: TicketProductRepository) { }

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
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getList(oid: number, query: TicketProductGetManyQuery): Promise<BaseResponse> {
    const { filter, limit, relation, sort } = query

    const ticketProductList = await this.ticketProductRepository.findMany({
      // relation,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
      },
      limit,
      sort,
    })

    return { data: { ticketProductList } }
  }

  async destroyZero(oid: number, ticketProductId: number) {
    await this.ticketProductRepository.delete({
      oid,
      id: ticketProductId,
      quantity: 0,
    })
    return { data: { ticketProductId } }
  }
}
