import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../../_libs/common/helpers'
import { Laboratory } from '../../../../../_libs/database/entities'
import {
  LaboratoryRepository,
  TicketLaboratoryRepository,
} from '../../../../../_libs/database/repositories'
import { StatisticTicketLaboratoryQuery } from './request'

@Injectable()
export class StatisticLaboratoryService {
  constructor(
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository
  ) { }

  async statisticTicketLaboratory(oid: number, query: StatisticTicketLaboratoryQuery) {
    const { page, limit, filter, sortStatistic } = query

    const promiseData = await Promise.all([
      this.ticketLaboratoryRepository.findAndSelect({
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
      this.ticketLaboratoryRepository.findAndSelect({
        condition: {
          oid,
          createdAt: filter.createdAt,
          status: filter.status,
        },
        groupBy: ['laboratoryId'],
        select: ['laboratoryId'],
        aggregate: {
          count: { COUNT: '*' },
          sumCostAmount: { SUM: ['costPrice'] },
          sumActualAmount: { SUM: ['actualPrice'] },
        },
        orderBy: sortStatistic || { laboratoryId: 'DESC' },
        limit: limit || 20,
        page: page || 1,
      }),
    ])

    const statisticTotal = promiseData[0].dataRaws
    const statisticPagination = promiseData[1].dataRaws

    let laboratoryMap: Record<string, Laboratory> = {}
    const laboratoryIds = statisticPagination.map((i) => i.laboratoryId)
    if (laboratoryIds.length) {
      const laboratoryList = await this.laboratoryRepository.findManyBy({
        oid,
        id: { IN: laboratoryIds },
        level: 1,
      })
      laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
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
          laboratoryId: i.laboratoryId,
          laboratory: laboratoryMap[i.laboratoryId],
          sumCostAmount: Number(i.sumCostAmount),
          sumActualAmount: Number(i.sumActualAmount),
        }
      }),
    }
  }
}
