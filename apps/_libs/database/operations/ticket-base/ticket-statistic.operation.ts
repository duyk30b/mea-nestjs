import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { Ticket } from '../../entities'
import { TicketRepository } from '../../repositories'

@Injectable()
export class TicketStatisticOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketRepository: TicketRepository
  ) { }

  async statistic(options: { condition: BaseCondition<Ticket>; groupTimeType: 'date' | 'month' }) {
    const { groupTimeType, condition } = options
    const where = this.ticketRepository.getWhereOptions(condition)

    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where(where)
      .select([
        'COUNT(*) AS "countTicket"',
        'SUM("totalMoney") AS "sumTotalMoney"',
        'SUM("itemsCostAmount") AS "sumItemsCostAmount"',
        'SUM("procedureMoney") AS "sumProcedureMoney"',
        'SUM("productMoney") AS "sumProductMoney"',
        'SUM("radiologyMoney") AS "sumRadiologyMoney"',
        'SUM("laboratoryMoney") AS "sumLaboratoryMoney"',
        'SUM("surcharge") AS "sumSurcharge"',
        'SUM("expense") AS "sumExpense"',
        'SUM("discountMoney" + "itemsDiscount") AS "sumDiscountMoney"',
        'SUM("profit") AS "sumProfit"',
        'SUM("debt") AS "sumDebt"',
      ])

    if (groupTimeType === 'month') {
      query = query.addSelect(['"year"', '"month"']).groupBy('"year"').addGroupBy('"month"')
    }
    if (groupTimeType === 'date') {
      query = query
        .addSelect(['"year"', '"month"', '"date"'])
        .groupBy('"year"')
        .addGroupBy('"month"')
        .addGroupBy('"date"')
    }

    const data = await query.getRawMany()
    return data.map((i) => ({
      year: i.year as number,
      month: i.month as number,
      date: i.date as number,
      countTicket: Number(i.countTicket),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumItemsCostAmount: Number(i.sumItemsCostAmount),
      sumProcedureMoney: Number(i.sumProcedureMoney),
      sumProductMoney: Number(i.sumProductMoney),
      sumRadiologyMoney: Number(i.sumRadiologyMoney),
      sumLaboratoryMoney: Number(i.sumLaboratoryMoney),
      sumSurcharge: Number(i.sumSurcharge),
      sumExpense: Number(i.sumExpense),
      sumDiscountMoney: Number(i.sumDiscountMoney),
      sumProfit: Number(i.sumProfit),
      sumDebt: Number(i.sumDebt),
    }))
  }
}
