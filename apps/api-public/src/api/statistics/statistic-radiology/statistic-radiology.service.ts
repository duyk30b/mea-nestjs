import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../../_libs/common/helpers'
import { Radiology } from '../../../../../_libs/database/entities'
import {
  RadiologyRepository,
  TicketRadiologyRepository,
} from '../../../../../_libs/database/repositories'
import { StatisticTicketRadiologyQuery } from './request'

@Injectable()
export class StatisticRadiologyService {
  constructor(
    private readonly radiologyRepository: RadiologyRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async statisticTicketRadiology(oid: number, query: StatisticTicketRadiologyQuery) {
    const { page, limit, filter, sortStatistic } = query

    const promiseData = await Promise.all([
      this.ticketRadiologyRepository.findAndSelect({
        condition: {
          oid,
          createdAt: filter.createdAt,
          status: filter.status,
        },
        aggregate: {
          count: { COUNT: '*' },
          sumCostAmount: { SUM: ['costPrice'] },
          sumActualAmount: { SUM: ['actualPrice'] },
        },
      }),
      this.ticketRadiologyRepository.findAndSelect({
        condition: {
          oid,
          createdAt: filter.createdAt,
          status: filter.status,
        },
        groupBy: ['radiologyId'],
        select: ['radiologyId'],
        aggregate: {
          count: { COUNT: '*' },
          sumCostAmount: { SUM: ['costPrice'] },
          sumActualAmount: { SUM: ['actualPrice'] },
        },
        orderBy: sortStatistic || { radiologyId: 'DESC' },
        limit: limit || 20,
        page: page || 1,
      }),
    ])

    const statisticTotal = promiseData[0].dataRaws
    const statisticPagination = promiseData[1].dataRaws

    let radiologyMap: Record<string, Radiology> = {}
    const radiologyIds = statisticPagination.map((i) => i.radiologyId)
    if (radiologyIds.length) {
      const radiologyList = await this.radiologyRepository.findManyBy({
        oid,
        id: { IN: radiologyIds },
      })
      radiologyMap = ESArray.arrayToKeyValue(radiologyList, 'id')
    }

    return {
      statisticTotal: {
        count: Number(statisticTotal[0].count),
        sumActualAmount: Number(statisticTotal[0].sumActualAmount),
        sumCostAmount: Number(statisticTotal[0].sumCostAmount),
      },
      statisticPagination: statisticPagination.map((i) => {
        return {
          count: Number(i.count),
          radiologyId: i.radiologyId,
          radiology: radiologyMap[i.radiologyId],
          sumCostAmount: Number(i.sumCostAmount),
          sumActualAmount: Number(i.sumActualAmount),
        }
      }),
    }
  }
}
