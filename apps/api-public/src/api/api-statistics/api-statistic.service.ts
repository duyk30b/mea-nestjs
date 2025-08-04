import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import { Customer, Procedure, Product } from '../../../../_libs/database/entities'
import { StatisticOperation } from '../../../../_libs/database/operations/statistic/statistic.operation'
import { ProductMovementRepository } from '../../../../_libs/database/repositories'
import { CustomerRepository } from '../../../../_libs/database/repositories/customer.repository'
import { ProcedureRepository } from '../../../../_libs/database/repositories/procedure.repository'
import { ProductRepository } from '../../../../_libs/database/repositories/product.repository'
import { TicketProcedureRepository } from '../../../../_libs/database/repositories/ticket-procedure.repository'
import { StatisticTopBestSellingQuery, StatisticTopCustomerBestTicketQuery } from './request'
import { StatisticProductHighMoneyQuery } from './request/statistic-top-product-high-money.query'

@Injectable()
export class ApiStatisticService {
  constructor(
    private readonly statisticRepository: StatisticOperation,
    private readonly productRepository: ProductRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository
  ) { }

  async sumWarehouse(oid: number): Promise<BaseResponse> {
    const data = await this.statisticRepository.sumWarehouse(oid)
    return {
      data,
    }
  }

  async topProductBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const { dataRaws } = await this.productMovementRepository.findAndSelect({
      condition: {
        oid,
        movementType: MovementType.Ticket,
        createdAt: { GTE: fromTime.getTime(), LT: toTime.getTime() },
      },
      groupBy: ['productId'],
      select: ['productId'],
      aggregate: {
        sumQuantity: { SUM: [{ SUB: [0, 'quantity'] }] },
        sumActualAmount: { SUM: [{ SUB: [0, { MUL: ['quantity', 'actualPrice'] }] }] },
        sumCostAmount: { SUM: [{ SUB: [0, 'costAmount'] }] },
        sumProfitAmount: {
          SUM: [
            {
              SUB: [{ SUB: [0, { MUL: ['quantity', 'actualPrice'] }] }, { SUB: [0, 'costAmount'] }],
            },
          ],
        },
      },
      orderBy: { [orderBy]: 'DESC' },
      limit,
    })

    const productIds = dataRaws.map((i) => i.productId)
    const productList = await this.productRepository.findManyBy({
      oid,
      id: { IN: productIds },
    })
    const productMap: Record<string, Product> = {}
    productList.forEach((i) => (productMap[i.id] = i))

    const topData = dataRaws.map((i) => ({
      productId: i.productId,
      sumQuantity: Number(i.sumQuantity),
      sumCostAmount: Number(i.sumCostAmount),
      sumActualAmount: Number(i.sumActualAmount),
      sumProfitAmount: Number(i.sumProfitAmount),
      product: productMap[i.productId],
    }))

    return { data: topData }
  }

  async topProductHighMoney(
    oid: number,
    query: StatisticProductHighMoneyQuery
  ): Promise<BaseResponse> {
    const { orderBy, limit } = query
    const data = await this.statisticRepository.topProductHighMoney({
      oid,
      limit,
      orderBy,
    })
    return { data }
  }

  async topProcedureBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const data = await this.ticketProcedureRepository.topProcedureBestSelling({
      condition: {
        oid,
        startedAt: { GTE: fromTime.getTime(), LTE: toTime.getTime() },
      },
      orderBy,
      limit,
    })

    const procedureIds = data.map((i) => i.procedureId)
    const procedureList = await this.procedureRepository.findManyBy({
      oid,
      id: { IN: procedureIds },
    })
    const procedureMap: Record<string, Procedure> = {}
    procedureList.forEach((i) => (procedureMap[i.id] = i))

    const topData = data.map((i) => ({
      procedureId: i.procedureId,
      sumQuantity: i.sumQuantity,
      sumActualAmount: i.sumActualAmount,
      procedure: procedureMap[i.procedureId],
    }))

    return { data: topData }
  }

  async topCustomerBestTicket(
    oid: number,
    query: StatisticTopCustomerBestTicketQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query
    const data = await this.statisticRepository.topCustomerBestTicket({
      oid,
      fromTime,
      toTime,
      orderBy,
      limit,
    })

    const customerIds = data.map((i) => i.customerId)
    const customerList = await this.customerRepository.findManyBy({
      oid,
      id: { IN: customerIds },
    })
    const customerMap: Record<string, Customer> = {}
    customerList.forEach((i) => (customerMap[i.id] = i))

    const topData = data.map((i) => ({
      customerId: i.customerId,
      sumItemsCostAmount: i.sumItemsCostAmount,
      sumExpense: i.sumExpense,
      sumSurcharge: i.sumSurcharge,
      sumTotalMoney: i.sumTotalMoney,
      sumProfit: i.sumProfit,
      sumDebt: i.sumDebt,
      countTicket: i.countTicket,
      customer: customerMap[i.customerId],
    }))

    return { data: topData }
  }

  async sumCustomerDebt(oid: number): Promise<BaseResponse> {
    const customerSumDebt = await this.customerRepository.sumDebt(oid)
    return { data: { customerSumDebt } }
  }
}
