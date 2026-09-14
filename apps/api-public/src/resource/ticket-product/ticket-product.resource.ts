import {
  TicketProductGetManyQuery,
  TicketProductPaginationQuery,
} from '@api-public/resource/ticket-product/ticket-product-get.query'
import { TicketProductRelationQuery } from '@api-public/resource/ticket-product/ticket-product-options.request'
import { ESArray } from '@libs/common/helpers'
import { Customer, Product, Ticket, TicketProduct } from '@libs/database/entities'
import {
  CustomerRepository,
  ProductRepository,
  TicketRepository,
  TicketUserRepository,
} from '@libs/database/repositories'
import { TicketProductRepository } from '@libs/database/repositories/ticket-product.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TicketProductResource {
  constructor(
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketUserRepository: TicketUserRepository
  ) {}

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
        createdAt: filter?.createdAt,
      },
      limit,
      sort,
    })

    return { ticketProductList }
  }

  async generateRelation(object: {
    oid: number
    ticketProductList: TicketProduct[]
    relation?: TicketProductRelationQuery
  }) {
    const { oid, ticketProductList, relation } = object

    const ticketProductIdList = ticketProductList.map((i) => i.id)
    const ticketIdList = ticketProductList.map((i) => i.ticketId)
    const customerIdList = ticketProductList.map((i) => i.customerId)
    const productIdList = ticketProductList.map((i) => i.productId)

    const [ticketList, customerList, productList] = await Promise.all([
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
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({
            id: { IN: ESArray.uniqueArray(productIdList) },
          })
        : <Product[]>[],
    ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')

    ticketProductList.forEach((tp: TicketProduct) => {
      if (relation.ticket) {
        tp.ticket = ticketMap[tp.ticketId]
      }
      if (relation.customer) {
        tp.customer = customerMap[tp.customerId]
      }
      if (relation.product) {
        tp.product = productMap[tp.productId]
      }
    })

    return ticketProductList
  }
}
