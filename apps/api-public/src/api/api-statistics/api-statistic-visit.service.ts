import { Injectable } from '@nestjs/common'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { StatisticVisitRepository } from '../../../../_libs/database/repository/statistic/statistic-visit.repository'
import { StatisticTimeQuery } from './request'

@Injectable()
export class ApiStatisticVisitService {
  constructor(private readonly statisticVisitRepository: StatisticVisitRepository) {}

  async statisticVisit(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime, timeType } = query
    const data = await this.statisticVisitRepository.statisticVisit({
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
        sumProceduresMoney: 0,
        sumProductsMoney: 0,
        sumDiscountMoney: 0,
        sumTotalMoney: 0,
        sumProfit: 0,
        sumDebt: 0,
        countVisit: 0,
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
}
