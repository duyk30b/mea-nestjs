import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Customer, Procedure, Product } from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ProcedureRepository } from '../../../../_libs/database/repository/procedure/procedure.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { StatisticRepository } from '../../../../_libs/database/repository/statistic/statistic.repository'
import {
  StatisticTopBestSellingQuery,
  StatisticTopCustomerBestInvoiceQuery,
  StatisticTopCustomerBestVisitQuery,
} from './request'
import { StatisticProductHighMoneyQuery } from './request/statistic-top-product-high-money.query'

@Injectable()
export class ApiStatisticService {
  constructor(
    private readonly statisticRepository: StatisticRepository,
    private readonly productRepository: ProductRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly customerRepository: CustomerRepository
  ) {}

  async sumWarehouse(oid: number): Promise<BaseResponse> {
    const data = await this.statisticRepository.sumWarehouse(oid)
    return {
      data: {
        totalCostAmount: Number(data.totalCostAmount),
        totalRetailMoney: Number(data.totalRetailMoney),
      },
    }
  }

  async topProductBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const data = await this.statisticRepository.topProductBestSelling({
      oid,
      fromTime: fromTime.getTime(),
      toTime: toTime.getTime(),
      limit,
      orderBy,
    })

    const productIds = data.map((i) => i.productId)
    const productList = await this.productRepository.findManyBy({
      oid,
      id: { IN: productIds },
    })
    const productMap: Record<string, Product> = {}
    productList.forEach((i) => (productMap[i.id] = i))

    const topData = data.map((i) => ({
      productId: i.productId,
      sumQuantity: i.sumQuantity,
      sumCostAmount: i.sumCostAmount,
      sumActualMoney: i.sumActualMoney,
      sumProfit: i.sumProfit,
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

  async topVisitProcedureBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const data = await this.statisticRepository.topVisitProcedureBestSelling({
      oid,
      fromTime: fromTime.getTime(),
      toTime: toTime.getTime(),
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
      sumActualMoney: i.sumActualMoney,
      procedure: procedureMap[i.procedureId],
    }))

    return { data: topData }
  }

  async topInvoiceProcedureBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const data = await this.statisticRepository.topInvoiceProcedureBestSelling({
      oid,
      fromTime: fromTime.getTime(),
      toTime: toTime.getTime(),
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
      sumActualMoney: i.sumActualMoney,
      procedure: procedureMap[i.procedureId],
    }))

    return { data: topData }
  }

  async topCustomerBestInvoice(
    oid: number,
    query: StatisticTopCustomerBestInvoiceQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query
    const data = await this.statisticRepository.topCustomerBestInvoice({
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
      sumTotalCostAmount: i.sumTotalCostAmount,
      sumItemActual: i.sumItemActual,
      sumExpense: i.sumExpense,
      sumTotalMoney: i.sumTotalMoney,
      sumProfit: i.sumProfit,
      sumDebt: i.sumDebt,
      countInvoice: i.countInvoice,
      customer: customerMap[i.customerId],
    }))

    return { data: topData }
  }

  async topCustomerBestVisit(
    oid: number,
    query: StatisticTopCustomerBestVisitQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query
    const data = await this.statisticRepository.topCustomerBestVisit({
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
      sumTotalCostAmount: i.sumTotalCostAmount,
      sumTotalMoney: i.sumTotalMoney,
      sumProfit: i.sumProfit,
      sumDebt: i.sumDebt,
      countVisit: i.countVisit,
      customer: customerMap[i.customerId],
    }))

    return { data: topData }
  }

  async sumCustomerDebt(oid: number): Promise<BaseResponse> {
    const customerSumDebt = await this.statisticRepository.sumCustomerDebt(oid)
    return { data: { customerSumDebt } }
  }
}
