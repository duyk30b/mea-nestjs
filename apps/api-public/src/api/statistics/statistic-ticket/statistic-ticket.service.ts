import { ESArray, ESTimer } from '@libs/common/helpers'
import CustomerGroup from '@libs/database/entities/customer_group.entity'
import {
  CustomerGroupRepository,
  CustomerRepository,
  TicketRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { StatisticTicketQuery } from './request'
import { StatisticTicketQueryTime } from './request/statistic-ticket-query-time'

@Injectable()
export class StatisticTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly customerGroupRepository: CustomerGroupRepository
  ) { }

  async groupByCustomer(oid: number, query: StatisticTicketQuery) {
    const { dataRaws } = await this.ticketRepository.findAndSelect({
      condition: {
        oid,
        createdAt: query?.filter?.createdAt,
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
        sumPaidTotal: { SUM: ['paidTotal'] },
        sumDebtTotal: { SUM: ['debtTotal'] },
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

    const statisticData = dataRaws.map((i) => ({
      customerId: i.customerId,
      sumItemsCostAmount: i.sumItemsCostAmount,
      sumExpense: i.sumExpense,
      sumSurcharge: i.sumSurcharge,
      sumTotalMoney: i.sumTotalMoney,
      sumProfit: i.sumProfit,
      sumPaidTotal: i.sumPaidTotal,
      sumDebtTotal: i.sumDebtTotal,
      countTicket: i.countTicket,
      customer: customerMap[i.customerId],
    }))

    return { statisticData }
  }

  async groupByCustomerGroup(oid: number, query: StatisticTicketQuery) {
    const { dataRaws } = await this.ticketRepository.findAndSelect({
      condition: {
        oid,
        createdAt: query?.filter?.createdAt,
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
        sumPaidTotal: { SUM: ['paidTotal'] },
        sumDebtTotal: { SUM: ['debtTotal'] },
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

    const customerGroupList = await this.customerGroupRepository.findManyBy({
      oid,
    })
    const customerGroupMap = ESArray.arrayToKeyValue(customerGroupList, 'id')

    const statisticDataMap: Record<
      number,
      {
        customerGroupId: string
        sumItemsCostAmount: number
        sumExpense: number
        sumSurcharge: number
        sumTotalMoney: number
        sumProfit: number
        sumPaidTotal: number
        sumDebtTotal: number
        countTicket: number
        customerGroup: CustomerGroup
      }
    > = {}

    dataRaws.forEach((i) => {
      const customer = customerMap[i.customerId]
      const customerGroup = customerGroupMap[customer.customerGroupId]
      if (!statisticDataMap[customer.customerGroupId]) {
        statisticDataMap[customer.customerGroupId] = {
          customerGroupId: customer.customerGroupId,
          sumItemsCostAmount: 0,
          sumExpense: 0,
          sumSurcharge: 0,
          sumTotalMoney: 0,
          sumProfit: 0,
          sumPaidTotal: 0,
          sumDebtTotal: 0,
          countTicket: 0,
          customerGroup,
        }
      }
      statisticDataMap[customer.customerGroupId].sumItemsCostAmount += Number(i.sumItemsCostAmount)
      statisticDataMap[customer.customerGroupId].sumExpense += Number(i.sumExpense)
      statisticDataMap[customer.customerGroupId].sumSurcharge += Number(i.sumSurcharge)
      statisticDataMap[customer.customerGroupId].sumTotalMoney += Number(i.sumTotalMoney)
      statisticDataMap[customer.customerGroupId].sumProfit += Number(i.sumProfit)
      statisticDataMap[customer.customerGroupId].sumPaidTotal += Number(i.sumPaidTotal)
      statisticDataMap[customer.customerGroupId].sumDebtTotal += Number(i.sumDebtTotal)
      statisticDataMap[customer.customerGroupId].countTicket += Number(i.countTicket)
    })

    const statisticData = Object.values(statisticDataMap).sort((a, b) => {
      if (query.sortStatistic) {
        const sortKey = Object.keys(query.sortStatistic)[0] as any
        const sortOrder = query.sortStatistic[sortKey]
        if (sortOrder === 'ASC') {
          return a[sortKey] - b[sortKey]
        } else {
          return b[sortKey] - a[sortKey]
        }
      }
      return 0
    })

    return { statisticData }
  }

  async groupByTime(oid: number, query: StatisticTicketQueryTime) {
    const { filter, fromTime, toTime, groupTimeType } = query

    const { dataRaws } = await this.ticketRepository.findAndSelect({
      condition: {
        oid,
        roomId: filter.roomId,
        status: filter?.status,
        createdAt: {
          GTE: fromTime.getTime(),
          LTE: toTime.getTime(),
        },
      },
      groupBy:
        groupTimeType === 'month'
          ? ['year', 'month']
          : groupTimeType === 'date'
            ? ['year', 'month', 'date']
            : undefined,
      select:
        groupTimeType === 'month'
          ? ['year', 'month']
          : groupTimeType === 'date'
            ? ['year', 'month', 'date']
            : [],
      aggregate: {
        countTicket: { COUNT: '*' },
        sumTotalMoney: { SUM: ['totalMoney'] },
        sumItemsCostAmount: { SUM: ['itemsCostAmount'] },
        sumProcedureMoney: { SUM: ['procedureMoney'] },
        sumProductMoney: { SUM: ['productMoney'] },
        sumRadiologyMoney: { SUM: ['radiologyMoney'] },
        sumLaboratoryMoney: { SUM: ['laboratoryMoney'] },
        sumDiscountMoney: { SUM: ['discountMoney'] },
        sumItemsDiscount: { SUM: ['itemsDiscount'] },
        sumExpense: { SUM: ['expense'] },
        sumSurcharge: { SUM: ['surcharge'] },
        sumPaidTotal: { SUM: ['paidTotal'] },
        sumDebtTotal: { SUM: ['debtTotal'] },
        sumProfit: { SUM: ['profit'] },
      },
    })

    const statisticData: Record<string, { [K in keyof (typeof dataRaws)[number]]: number }> = {}
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
      statisticData[time] = {
        year: currentTime.year,
        month: currentTime.month + 1,
        date: currentTime.date,
        countTicket: 0,
        sumTotalMoney: 0,
        sumItemsCostAmount: 0,
        sumProcedureMoney: 0,
        sumProductMoney: 0,
        sumRadiologyMoney: 0,
        sumLaboratoryMoney: 0,
        sumDiscountMoney: 0,
        sumItemsDiscount: 0,
        sumExpense: 0,
        sumSurcharge: 0,
        sumPaidTotal: 0,
        sumDebtTotal: 0,
        sumProfit: 0,
      }
    } while (date.getTime() <= toTime.getTime())

    dataRaws.forEach((i) => {
      const year = i.year
      const month = `0${i.month}`.slice(-2)
      const date = `0${i.date}`.slice(-2)
      let time = ''
      if (groupTimeType === 'date') time = `${date}/${month}/${year}`
      if (groupTimeType === 'month') time = `${month}/${year}`
      statisticData[time] = {
        year: i.year,
        month: i.month,
        date: i.date,
        countTicket: Number(i.countTicket),
        sumTotalMoney: Number(i.sumTotalMoney),
        sumItemsCostAmount: Number(i.sumItemsCostAmount),
        sumProcedureMoney: Number(i.sumProcedureMoney),
        sumProductMoney: Number(i.sumProductMoney),
        sumRadiologyMoney: Number(i.sumRadiologyMoney),
        sumLaboratoryMoney: Number(i.sumLaboratoryMoney),
        sumDiscountMoney: Number(i.sumDiscountMoney),
        sumItemsDiscount: Number(i.sumItemsDiscount),
        sumExpense: Number(i.sumExpense),
        sumSurcharge: Number(i.sumSurcharge),
        sumPaidTotal: Number(i.sumPaidTotal),
        sumDebtTotal: Number(i.sumDebtTotal),
        sumProfit: Number(i.sumProfit),
      }
    })

    return { statisticData }
  }
}
