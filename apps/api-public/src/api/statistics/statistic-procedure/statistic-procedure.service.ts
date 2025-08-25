import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../../_libs/common/helpers'
import { Procedure } from '../../../../../_libs/database/entities'
import {
  ProcedureRepository,
  TicketProcedureRepository,
} from '../../../../../_libs/database/repositories'
import { StatisticTicketProcedureQuery } from './request'

@Injectable()
export class StatisticProcedureService {
  constructor(
    private readonly procedureRepository: ProcedureRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository
  ) { }

  async statisticTicketProcedure(oid: number, query: StatisticTicketProcedureQuery) {
    const { page, limit, filter, sortStatistic } = query

    const promiseData = await Promise.all([
      this.ticketProcedureRepository.findAndSelect({
        condition: {
          oid,
          createdAt: filter.createdAt,
          status: filter.status,
        },
        aggregate: {
          count: { COUNT: '*' },
          sumActualAmount: { SUM: [{ MUL: ['quantity', 'actualPrice'] }] },
        },
      }),
      this.ticketProcedureRepository.findAndSelect({
        condition: {
          oid,
          createdAt: filter.createdAt,
          status: filter.status,
        },
        groupBy: ['procedureId'],
        select: ['procedureId'],
        aggregate: {
          count: { COUNT: '*' },
          sumQuantity: { SUM: ['quantity'] },
          sumActualAmount: { SUM: [{ MUL: ['quantity', 'actualPrice'] }] },
        },
        orderBy: sortStatistic || { procedureId: 'DESC' },
        limit: limit || 20,
        page: page || 1,
      }),
    ])

    const statisticTotal = promiseData[0].dataRaws
    const statisticPagination = promiseData[1].dataRaws

    let procedureMap: Record<string, Procedure> = {}
    const procedureIds = statisticPagination.map((i) => i.procedureId)
    if (procedureIds.length) {
      const procedureList = await this.procedureRepository.findManyBy({
        oid,
        id: { IN: procedureIds },
      })
      procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    }

    return {
      statisticTotal: {
        count: Number(statisticTotal[0].count),
        sumActualAmount: Number(statisticTotal[0].sumActualAmount),
      },
      statisticPagination: statisticPagination.map((i) => {
        return {
          count: Number(i.count),
          procedureId: i.procedureId,
          procedure: procedureMap[i.procedureId],
          sumQuantity: Number(i.sumQuantity),
          sumActualAmount: Number(i.sumActualAmount),
        }
      }),
    }
  }
}
