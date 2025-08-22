import { Injectable } from '@nestjs/common'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketStatisticOperation } from '../../../../_libs/database/operations/ticket-base/ticket-statistic.operation'
import { StatisticTicketQuery } from './request'

@Injectable()
export class ApiStatisticTicketService {
  constructor(private readonly ticketStatisticOperation: TicketStatisticOperation) { }

  async statisticTicket(oid: number, query: StatisticTicketQuery): Promise<BaseResponse> {
    const { filter, groupTimeType, fromTime, toTime } = query

    const data = await this.ticketStatisticOperation.statistic({
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

    return { data: dataMap }
  }
}
