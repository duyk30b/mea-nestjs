import { Injectable } from '@nestjs/common'
import { ESArray, ESTimer } from '../../../../../_libs/common/helpers'
import { StatisticTicketOperation } from '../../../../../_libs/database/operations'
import { CustomerRepository, TicketRepository } from '../../../../../_libs/database/repositories'
import { StatisticTicketQuery } from './request'
import { StatisticTicketQueryTime } from './request/statistic-ticket-query'

@Injectable()
export class StatisticTicketService {
  constructor(
    private readonly statisticTicketOperation: StatisticTicketOperation,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository
  ) { }

  async groupByCustomer(oid: number, query: StatisticTicketQuery) {
    const { dataRaws } = await this.ticketRepository.findAndSelect({
      condition: {
        oid,
        startedAt: query?.filter?.startedAt,
        status: query?.filter?.status,
      },
      groupBy: ['customerId'],
      select: ['customerId'],
      aggregate: {
        countTicket: { COUNT: '*' },
        sumItemsCostAmount: { SUM: ['itemsCostAmount'] },
        sumExpense: { SUM: ['expense'] },
        sumSurcharge: { SUM: ['surcharge'] },
        sumTotalMoney: { SUM: ['totalMoney'] },
        sumDebt: { SUM: ['debt'] },
        sumProfit: { SUM: ['profit'] },
      },
      limit: query.limit || 20,
      orderBy: query.sortStatistic || { customerId: 'DESC' },
      page: query.page || 1,
    })

    const customerIds = dataRaws.map((i) => i.customerId)
    const customerList = await this.customerRepository.findManyBy({
      oid,
      id: { IN: customerIds },
    })
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')

    const dataStatistic = dataRaws.map((i) => ({
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

    return { dataStatistic }
  }

  async statistic(oid: number, query: StatisticTicketQueryTime) {
    const { filter, groupTimeType, fromTime, toTime } = query

    const data = await this.statisticTicketOperation.statistic({
      condition: {
        oid,
        registeredAt: {
          GTE: fromTime.getTime(),
          LTE: toTime.getTime(),
        },
        roomId: filter.roomId,
        status: filter.status,
      },
      groupTimeType,
    })
    // tạo ra 1 dataMap có đầy đủ các giá trị = 0
    const dataMap: Record<string, (typeof data)[number] & { oid: number }> = {}
    const date = new Date(fromTime.getTime())
    do {
      const currentTime = ESTimer.info(date, 7)
      let time = ''
      if (groupTimeType === 'date') {
        time = ESTimer.timeToText(date, 'DD/MM/YYYY', 7)
        date.setDate(date.getDate() + 1)
      }
      if (groupTimeType === 'month') {
        time = ESTimer.timeToText(date, 'MM/YYYY', 7)
        date.setMonth(date.getMonth() + 1)
      }
      dataMap[time] = {
        oid,
        year: currentTime.year,
        month: currentTime.month + 1,
        date: currentTime.date,
        sumItemsCostAmount: 0,
        sumProcedureMoney: 0,
        sumProductMoney: 0,
        sumRadiologyMoney: 0,
        sumLaboratoryMoney: 0,
        sumSurcharge: 0,
        sumExpense: 0,
        sumDiscountMoney: 0,
        sumTotalMoney: 0,
        sumProfit: 0,
        sumDebt: 0,
        countTicket: 0,
      }
    } while (date.getTime() <= toTime.getTime())

    data.forEach((i) => {
      const year = i.year
      const month = `0${i.month}`.slice(-2)
      const date = `0${i.date}`.slice(-2)
      let time = ''
      if (groupTimeType === 'date') time = `${date}/${month}/${year}`
      if (groupTimeType === 'month') time = `${month}/${year}`
      dataMap[time] = { ...i, oid }
    })

    return dataMap
  }
}
