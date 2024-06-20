import { Injectable } from '@nestjs/common'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { StatisticInvoiceRepository } from '../../../../_libs/database/repository/statistic/statistic-invoice.repository'
import { StatisticTimeQuery } from './request'

@Injectable()
export class ApiStatisticInvoiceService {
  constructor(private readonly statisticInvoiceRepository: StatisticInvoiceRepository) {}

  async statisticInvoice(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime, timeType } = query

    const data = await this.statisticInvoiceRepository.statisticInvoice({
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
        year: currentTime.year,
        month: currentTime.month + 1,
        date: currentTime.date,
        sumTotalCostAmount: 0,
        sumItemsActual: 0,
        sumSurcharge: 0,
        sumExpense: 0,
        sumDiscountMoney: 0,
        sumTotalMoney: 0,
        sumProfit: 0,
        sumDebt: 0,
        countInvoice: 0,
      }
    } while (date.getTime() <= toTime.getTime())

    data.forEach((i) => {
      const year = i.year
      const month = `0${i.month}`.slice(-2)
      const date = `0${i.date}`.slice(-2)
      let time = ''
      if (timeType === 'date') time = `${date}/${month}/${year}`
      if (timeType === 'month') time = `${month}/${year}`
      dataMap[time] = i
    })

    return { data: dataMap }
  }

  // async sumInvoiceSurchargeAndExpenses(
  //   oid: number,
  //   query: StatisticTimeQuery
  // ): Promise<BaseResponse> {
  //   const { fromTime, toTime, timeType } = query

  //   const [surchargeData, expenseData] = await Promise.all([
  //     this.statisticRepository.sumInvoiceSurcharge({
  //       oid,
  //       fromTime,
  //       toTime,
  //       timeType,
  //     }),
  //     this.statisticRepository.sumInvoiceExpense({
  //       oid,
  //       fromTime: query.fromTime,
  //       toTime: query.toTime,
  //       timeType,
  //     }),
  //   ])

  //   // tạo ra 1 dataMap có đầy đủ các giá trị = 0
  //   const surchargeMap: Record<
  //     string,
  //     { name: string; data: Record<string, { sumMoney: number }> }
  //   > = {}
  //   const expenseMap: Record<string, { name: string; data: Record<string, { sumMoney: number }> }> =
  //     {}

  //   surchargeData.forEach((i) => {
  //     if (!surchargeMap[i.key]) {
  //       surchargeMap[i.key] = { name: i.name, data: {} }

  //       const date = new Date(fromTime.getTime())
  //       do {
  //         let time = ''
  //         if (timeType === 'date') {
  //           time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
  //           date.setDate(date.getDate() + 1)
  //         }
  //         if (timeType === 'month') {
  //           time = DTimer.timeToText(date, 'MM/YYYY', 7)
  //           date.setMonth(date.getMonth() + 1)
  //         }
  //         surchargeMap[i.key].data[time] = { sumMoney: 0 }
  //       } while (date.getTime() <= toTime.getTime())
  //     }

  //     const year = i.year
  //     const month = `0${i.month}`.slice(-2)
  //     const date = `0${i.date}`.slice(-2)
  //     let time = ''
  //     if (timeType === 'date') time = `${date}/${month}/${year}`
  //     if (timeType === 'month') time = `${month}/${year}`

  //     surchargeMap[i.key].data[time] = { sumMoney: i.sumMoney }
  //   })

  //   expenseData.forEach((i) => {
  //     if (!expenseMap[i.key]) {
  //       expenseMap[i.key] = { name: i.name, data: {} }

  //       const date = new Date(fromTime.getTime())
  //       do {
  //         let time = ''
  //         if (timeType === 'date') {
  //           time = DTimer.timeToText(date, 'DD/MM/YYYY', 7)
  //           date.setDate(date.getDate() + 1)
  //         }
  //         if (timeType === 'month') {
  //           time = DTimer.timeToText(date, 'MM/YYYY', 7)
  //           date.setMonth(date.getMonth() + 1)
  //         }
  //         expenseMap[i.key].data[time] = { sumMoney: 0 }
  //       } while (date.getTime() <= toTime.getTime())
  //     }

  //     const year = i.year
  //     const month = `0${i.month}`.slice(-2)
  //     const date = `0${i.date}`.slice(-2)
  //     let time = ''
  //     if (timeType === 'date') time = `${date}/${month}/${year}`
  //     if (timeType === 'month') time = `${month}/${year}`

  //     expenseMap[i.key].data[time] = { sumMoney: i.sumMoney }
  //   })

  //   return { data: { surcharge: surchargeMap, expense: expenseMap } }
  // }

  // async totalMoneyMonth(oid: number, year: number, month: number): Promise<BaseResponse> {
  //   const data = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => ({
  //     date: i + 1,
  //     from: Date.UTC(year, month - 1, i + 1, -7), // lấy UTC+7
  //     to: Date.UTC(year, month - 1, i + 2, -7) - 1, // lấy UTC+7
  //     totalMoney: 0,
  //     profit: 0,
  //   }))
  //   const startMonth = Date.UTC(year, month - 1, 1, -7)
  //   const endMonth = Date.UTC(year, month, 1, -7) - 1

  //   const invoices = await this.invoiceRepository.findManyBy({
  //     oid,
  //     startedAt: { BETWEEN: [startMonth, endMonth] },
  //     status: { IN: [InvoiceStatus.Debt, InvoiceStatus.Success] },
  //   })
  //   invoices.forEach((invoice) => {
  //     const date = new Date(invoice.startedAt + 7 * 60 * 60 * 1000).getUTCDate()
  //     data[date - 1].totalMoney += invoice.totalMoney
  //     data[date - 1].profit += invoice.profit
  //   })

  //   return { data: { data, year, month } }
  // }
}
