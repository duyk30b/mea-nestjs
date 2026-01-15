import { Injectable } from '@nestjs/common'
import { ProductRepository } from '../../../../_libs/database/repositories'
import { TicketProductRepository } from '../../../../_libs/database/repositories/ticket-product.repository'
import {
  TicketProductGetManyQuery,
  TicketProductPaginationQuery,
} from './request'

@Injectable()
export class ApiTicketProductService {
  constructor(
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly productRepository: ProductRepository
  ) { }

  async pagination(oid: number, query: TicketProductPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketProductList } = await this.ticketProductRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    return { page, limit, total, ticketProductList }
  }

  async getList(oid: number, query: TicketProductGetManyQuery) {
    const { filter, limit, relation, sort } = query

    const ticketProductList = await this.ticketProductRepository.findMany({
      // relation,
      condition: {
        oid,
        customerId: filter?.customerId,
        productId: filter?.productId,
        ticketId: filter?.ticketId,
        deliveryStatus: filter?.deliveryStatus,
        createdAt: filter?.createdAt,
      },
      limit,
      sort,
    })

    return { ticketProductList }
  }

  async destroyZero(oid: number, ticketProductId: string) {
    await this.ticketProductRepository.deleteBasic({
      oid,
      id: ticketProductId,
      unitQuantity: 0,
    })
    return { ticketProductId }
  }
}
