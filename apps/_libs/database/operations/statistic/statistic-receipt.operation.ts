import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { Receipt } from '../../entities'
import { ReceiptStatus } from '../../entities/receipt.entity'

@Injectable()
export class StatisticReceiptOperation {
  constructor(@InjectEntityManager() private manager: EntityManager) { }

  async statisticReceipt(options: {
    oid: number
    fromTime: Date
    toTime: Date
    timeType: 'date' | 'month'
  }) {
    const { oid, timeType } = options
    const fromTime = options.fromTime.getTime()
    const toTime = options.toTime.getTime()

    const whereReceipt: FindOptionsWhere<Receipt> = {
      oid,
      status: In([ReceiptStatus.Debt, ReceiptStatus.Completed]),
      startedAt: Between(fromTime, toTime),
    }

    let query = this.manager
      .createQueryBuilder(Receipt, 'receipt')
      .where(whereReceipt)
      .select([
        'SUM("discountMoney") AS "sumDiscountMoney"',
        'SUM("totalMoney") AS "sumTotalMoney"',
        'SUM("debt") AS "sumDebt"',
        'COUNT(*) AS "countReceipt"',
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

    const dataList = await query.getRawMany()

    return dataList.map((i) => ({
      oid,
      year: i.year as number,
      month: i.month as number,
      date: i.date as number,
      sumDiscountMoney: Number(i.sumDiscountMoney),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumDebt: Number(i.sumDebt),
      countReceipt: Number(i.countReceipt),
    }))
  }
}
