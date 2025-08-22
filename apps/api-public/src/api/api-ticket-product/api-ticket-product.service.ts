import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { Product } from '../../../../_libs/database/entities'
import { ProductRepository } from '../../../../_libs/database/repositories'
import { TicketProductRepository } from '../../../../_libs/database/repositories/ticket-product.repository'
import {
  TicketProductGetManyQuery,
  TicketProductPaginationQuery,
  TicketProductStatisticQuery,
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

  async destroyZero(oid: number, ticketProductId: number) {
    await this.ticketProductRepository.delete({
      oid,
      id: ticketProductId,
      quantity: 0,
    })
    return { ticketProductId }
  }

  async statisticProduct(oid: number, query: TicketProductStatisticQuery) {
    const { filter, sortStatistic, page, limit } = query

    const promiseData = await Promise.all([
      this.ticketProductRepository.findAndSelect({
        condition: {
          oid,
          deliveryStatus: { IN: [DeliveryStatus.Delivered] },
          quantity: { GT: 0 },
          createdAt: filter?.createdAt,
        },
        groupBy: ['productId'],
        select: ['productId'],
        aggregate: {
          count: { COUNT: '*' },
          sumQuantity: { SUM: ['quantity'] },
          sumCostAmount: { SUM: ['costAmount'] },
          sumActualAmount: { SUM: [{ MUL: ['quantity', 'actualPrice'] }] },
          sumProfitAmount: { SUM: [{ SUB: [{ MUL: ['quantity', 'actualPrice'] }, 'costAmount'] }] },
        },
        orderBy: sortStatistic || { productId: 'DESC' },
        limit: limit || 20,
        page: page || 1,
      }),
      this.ticketProductRepository.countGroup({
        condition: {
          oid,
          deliveryStatus: { IN: [DeliveryStatus.Delivered] },
          quantity: { GT: 0 },
          createdAt: filter?.createdAt,
        },
        groupBy: ['productId'],
      }),
    ])
    const dataRaws = promiseData[0].dataRaws
    const total = promiseData[1]

    let productMap: Record<string, Product> = {}
    const productIds = dataRaws.map((i) => i.productId)
    if (productIds.length) {
      const productList = await this.productRepository.findManyBy({
        oid,
        id: { IN: productIds },
      })
      productMap = ESArray.arrayToKeyValue(productList, 'id')
    }

    const dataStatistic = dataRaws.map((i) => {
      return {
        count: Number(i.count),
        productId: i.productId,
        product: productMap[i.productId],
        sumQuantity: Number(i.sumQuantity),
        sumCostAmount: Number(i.sumCostAmount),
        sumActualAmount: Number(i.sumActualAmount),
        sumProfitAmount: Number(i.sumProfitAmount),
      }
    })
    return { dataStatistic, total }
  }
}
