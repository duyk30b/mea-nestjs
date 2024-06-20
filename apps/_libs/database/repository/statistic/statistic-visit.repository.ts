import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { Visit } from '../../entities'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class StatisticVisitRepository {
  constructor(@InjectEntityManager() private manager: EntityManager) {}

  async statisticVisit(options: {
    oid: number
    fromTime: Date
    toTime: Date
    timeType: 'date' | 'month'
  }) {
    const { oid, timeType } = options
    const fromTime = options.fromTime.getTime()
    const toTime = options.toTime.getTime()

    const whereVisit: FindOptionsWhere<Visit> = {
      oid,
      visitStatus: In([VisitStatus.Debt, VisitStatus.Completed]),
      endedAt: Between(fromTime, toTime),
    }
    let query = this.manager
      .createQueryBuilder(Visit, 'invoice')
      .where(whereVisit)
      .select([
        'SUM("totalCostAmount") AS "sumTotalCostAmount"',
        'SUM("proceduresMoney") AS "sumProceduresMoney"',
        'SUM("productsMoney") AS "sumProductsMoney"',
        'SUM("discountMoney") AS "sumDiscountMoney"',
        'SUM("totalMoney") AS "sumTotalMoney"',
        'SUM("profit") AS "sumProfit"',
        'SUM("debt") AS "sumDebt"',
        'COUNT(*) AS "countVisit"',
      ])

    if (timeType === 'month') {
      query = query.addSelect(['"year"', '"month"']).groupBy('"year"').addGroupBy('"month"')
    }
    if (timeType === 'date') {
      query = query
        .addSelect(['"year"', '"month"', '"date"'])
        .groupBy('"year"')
        .addGroupBy('"month"')
        .addGroupBy('"date"')
    }

    const data = await query.getRawMany()
    return data.map((i) => ({
      oid,
      year: i.year as number,
      month: i.month as number,
      date: i.date as number,
      sumTotalCostAmount: Number(i.sumTotalCostAmount),
      sumProceduresMoney: Number(i.sumProceduresMoney),
      sumProductsMoney: Number(i.sumProductsMoney),
      sumDiscountMoney: Number(i.sumDiscountMoney),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumProfit: Number(i.sumProfit),
      sumDebt: Number(i.sumDebt),
      countVisit: Number(i.countVisit),
    }))
  }
}
