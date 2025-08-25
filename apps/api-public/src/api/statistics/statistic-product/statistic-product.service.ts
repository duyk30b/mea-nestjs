import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../../_libs/common/helpers'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { Product } from '../../../../../_libs/database/entities'
import { StatisticProductOperation } from '../../../../../_libs/database/operations'
import {
  ProductRepository,
  TicketProductRepository,
} from '../../../../../_libs/database/repositories'
import { StatisticProductHighMoneyQuery } from './request'
import { StatisticTicketProductQuery } from './request/statistic-ticket-product.query'

@Injectable()
export class StatisticProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly statisticProductOperation: StatisticProductOperation
  ) { }

  async sumWarehouse(oid: number) {
    const data = await this.statisticProductOperation.sumWarehouse(oid)
    return data
  }

  async topProductHighMoney(oid: number, query: StatisticProductHighMoneyQuery) {
    const { orderBy, limit } = query
    const data = await this.statisticProductOperation.topProductHighMoney({
      oid,
      limit,
      orderBy,
    })
    return data
  }

  async statisticTicketProduct(oid: number, query: StatisticTicketProductQuery) {
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
