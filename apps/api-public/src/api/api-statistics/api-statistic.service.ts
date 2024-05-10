import { Injectable } from '@nestjs/common'
import { LimitQuery } from '../../../../_libs/common/dto'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { InvoiceStatus } from '../../../../_libs/database/common/variable'
import { Customer, Product } from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { StatisticRepository } from '../../../../_libs/database/repository/statistic/statistic.repository'
import {
  StatisticTimeQuery,
  StatisticTopBestSellingQuery,
  StatisticTopCustomerBestInvoiceQuery,
} from './request'
import { StatisticProductHighMoneyQuery } from './request/statistic-top-product-high-money.query'

@Injectable()
export class ApiStatisticService {
  constructor(
    private readonly statisticRepository: StatisticRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly productRepository: ProductRepository,
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

  async topProcedureBestSelling(
    oid: number,
    query: StatisticTopBestSellingQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, orderBy, limit } = query

    const data = await this.statisticRepository.topProcedureBestSelling({
      oid,
      fromTime: fromTime.getTime(),
      toTime: toTime.getTime(),
      orderBy,
      limit,
    })
    return { data }
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
      sumItemCost: i.sumItemCost,
      sumItemActual: i.sumItemActual,
      sumExpense: i.sumExpense,
      sumRevenue: i.sumRevenue,
      sumProfit: i.sumProfit,
      sumDebt: i.sumDebt,
      countInvoice: i.countInvoice,
      customer: customerMap[i.customerId],
    }))

    return { data: topData }
  }

  async sumCustomerDebt(oid: number): Promise<BaseResponse> {
    const customerSumDebt = await this.statisticRepository.sumCustomerDebt(oid)
    return { data: { customerSumDebt } }
  }

  async sumMoneyOrder(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    return {
      data: {
        invoice: await this.sumMoneyInvoice(oid, query),
        receipt: await this.sumMoneyReceipt(oid, query),
        other: await this.sumInvoiceSurchargeAndExpenses(oid, query),
      },
    }
  }

  async sumMoneyInvoice(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime, timeType } = query

    const data = await this.statisticRepository.sumMoneyInvoice({
      oid,
      fromTime,
      toTime,
      timeType,
    })
    // tạo ra 1 dataMap có đầy đủ các giá trị = 0
    const dataMap: Record<string, (typeof data)[number]> = {}
    const date = new Date(fromTime.getTime())
    do {
      const currentTime = DTimer.info(date, 7)
      let time = ''
      if (timeType === 'date') {
        time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
        date.setDate(date.getDate() + 1)
      }
      if (timeType === 'month') {
        time = DTimer.timeToText(date, 'MM/YYYY', 7)
        date.setMonth(date.getMonth() + 1)
      }
      dataMap[time] = {
        oid,
        shipYear: currentTime.year,
        shipMonth: currentTime.month + 1,
        shipDate: currentTime.date,
        sumItemsCost: 0,
        sumItemsActual: 0,
        sumItemsProfit: 0,
        sumSurcharge: 0,
        sumDiscountMoney: 0,
        sumExpense: 0,
        sumRevenue: 0,
        sumProfit: 0,
        sumDebt: 0,
        countInvoice: 0,
      }
    } while (date.getTime() <= toTime.getTime())

    data.forEach((i) => {
      const year = i.shipYear
      const month = `0${i.shipMonth}`.slice(-2)
      const date = `0${i.shipDate}`.slice(-2)
      let time = ''
      if (timeType === 'date') time = `${date}/${month}/${year}`
      if (timeType === 'month') time = `${month}/${year}`
      dataMap[time] = i
    })

    return { data: dataMap }
  }

  async sumMoneyReceipt(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime, timeType } = query

    const data = await this.statisticRepository.sumMoneyReceipt({
      oid,
      fromTime,
      toTime,
      timeType,
    })

    // tạo ra 1 dataMap có đầy đủ các giá trị = 0
    const dataMap: Record<string, (typeof data)[number]> = {}
    const date = new Date(fromTime.getTime())
    do {
      const currentTime = DTimer.info(date, 7)
      let time = ''
      if (timeType === 'date') {
        time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
        date.setDate(date.getDate() + 1)
      }
      if (timeType === 'month') {
        time = DTimer.timeToText(date, 'MM/YYYY', 7)
        date.setMonth(date.getMonth() + 1)
      }
      dataMap[time] = {
        oid,
        shipYear: currentTime.year,
        shipMonth: currentTime.month + 1,
        shipDate: currentTime.date,
        sumRevenue: 0,
        countReceipt: 0,
      }
    } while (date.getTime() <= toTime.getTime())

    data.forEach((i) => {
      const year = i.shipYear
      const month = `0${i.shipMonth}`.slice(-2)
      const date = `0${i.shipDate}`.slice(-2)
      let time = ''
      if (timeType === 'date') time = `${date}/${month}/${year}`
      if (timeType === 'month') time = `${month}/${year}`
      dataMap[time] = i
    })

    return { data: dataMap }
  }

  async sumInvoiceSurchargeAndExpenses(
    oid: number,
    query: StatisticTimeQuery
  ): Promise<BaseResponse> {
    const { fromTime, toTime, timeType } = query

    const [surchargeData, expenseData] = await Promise.all([
      this.statisticRepository.sumInvoiceSurcharge({
        oid,
        fromTime,
        toTime,
        timeType,
      }),
      this.statisticRepository.sumInvoiceExpense({
        oid,
        fromTime: query.fromTime,
        toTime: query.toTime,
        timeType,
      }),
    ])

    // tạo ra 1 dataMap có đầy đủ các giá trị = 0
    const surchargeMap: Record<
      string,
      { name: string; data: Record<string, { sumMoney: number }> }
    > = {}
    const expenseMap: Record<string, { name: string; data: Record<string, { sumMoney: number }> }> =
      {}

    surchargeData.forEach((i) => {
      if (!surchargeMap[i.key]) {
        surchargeMap[i.key] = { name: i.name, data: {} }

        const date = new Date(fromTime.getTime())
        do {
          let time = ''
          if (timeType === 'date') {
            time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
            date.setDate(date.getDate() + 1)
          }
          if (timeType === 'month') {
            time = DTimer.timeToText(date, 'MM/YYYY', 7)
            date.setMonth(date.getMonth() + 1)
          }
          surchargeMap[i.key].data[time] = { sumMoney: 0 }
        } while (date.getTime() <= toTime.getTime())
      }

      const year = i.shipYear
      const month = `0${i.shipMonth}`.slice(-2)
      const date = `0${i.shipDate}`.slice(-2)
      let time = ''
      if (timeType === 'date') time = `${date}/${month}/${year}`
      if (timeType === 'month') time = `${month}/${year}`

      surchargeMap[i.key].data[time] = { sumMoney: i.sumMoney }
    })

    expenseData.forEach((i) => {
      if (!expenseMap[i.key]) {
        expenseMap[i.key] = { name: i.name, data: {} }

        const date = new Date(fromTime.getTime())
        do {
          let time = ''
          if (timeType === 'date') {
            time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
            date.setDate(date.getDate() + 1)
          }
          if (timeType === 'month') {
            time = DTimer.timeToText(date, 'MM/YYYY', 7)
            date.setMonth(date.getMonth() + 1)
          }
          expenseMap[i.key].data[time] = { sumMoney: 0 }
        } while (date.getTime() <= toTime.getTime())
      }

      const year = i.shipYear
      const month = `0${i.shipMonth}`.slice(-2)
      const date = `0${i.shipDate}`.slice(-2)
      let time = ''
      if (timeType === 'date') time = `${date}/${month}/${year}`
      if (timeType === 'month') time = `${month}/${year}`

      expenseMap[i.key].data[time] = { sumMoney: i.sumMoney }
    })

    return { data: { surcharge: surchargeMap, expense: expenseMap } }
  }

  async revenueMonth(oid: number, year: number, month: number): Promise<BaseResponse> {
    const data = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => ({
      date: i + 1,
      from: Date.UTC(year, month - 1, i + 1, -7), // lấy UTC+7
      to: Date.UTC(year, month - 1, i + 2, -7) - 1, // lấy UTC+7
      revenue: 0,
      profit: 0,
    }))
    const startMonth = Date.UTC(year, month - 1, 1, -7)
    const endMonth = Date.UTC(year, month, 1, -7) - 1

    const invoices = await this.invoiceRepository.findManyBy({
      oid,
      startedAt: { BETWEEN: [startMonth, endMonth] },
      status: { IN: [InvoiceStatus.Debt, InvoiceStatus.Success] },
    })
    invoices.forEach((invoice) => {
      const date = new Date(invoice.startedAt + 7 * 60 * 60 * 1000).getUTCDate()
      data[date - 1].revenue += invoice.revenue
      data[date - 1].profit += invoice.profit
    })

    return { data: { data, year, month } }
  }
}
