import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { PurchaseOrder } from '../../entities'
import { PurchaseOrderStatus } from '../../entities/purchase-order.entity'

@Injectable()
export class StatisticPurchaseOrderOperation {
  constructor(@InjectEntityManager() private manager: EntityManager) { }

  async statisticPurchaseOrder(options: {
    oid: number
    fromTime: Date
    toTime: Date
    timeType: 'date' | 'month'
  }) {
    const { oid, timeType } = options
    const fromTime = options.fromTime.getTime()
    const toTime = options.toTime.getTime()

    const wherePurchaseOrder: FindOptionsWhere<PurchaseOrder> = {
      oid,
      status: In([PurchaseOrderStatus.Debt, PurchaseOrderStatus.Completed]),
      startedAt: Between(fromTime, toTime),
    }

    let query = this.manager
      .createQueryBuilder(PurchaseOrder, '"purchaseOrder"')
      .where(wherePurchaseOrder)
      .select([
        'SUM("discountMoney") AS "sumDiscountMoney"',
        'SUM("totalMoney") AS "sumTotalMoney"',
        'SUM("debt") AS "sumDebt"',
        'COUNT(*) AS "countPurchaseOrder"',
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
      countPurchaseOrder: Number(i.countPurchaseOrder),
    }))
  }
}
