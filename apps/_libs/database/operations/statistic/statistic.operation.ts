import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { MovementType } from '../../common/variable'
import { ProductMovement, Ticket } from '../../entities'
import { TicketStatus } from '../../entities/ticket.entity'

@Injectable()
export class StatisticOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async sumWarehouse(oid: number) {
    const data: { warehouseId: number; sumCostAmount: string; sumRetailAmount: string }[] =
      await this.manager.query(`
        SELECT 
            "Batch"."warehouseId",
            SUM("Batch"."costPrice" * "Batch"."quantity") AS "sumCostAmount",
            SUM("Batch"."quantity" * "Product"."retailPrice") AS "sumRetailAmount"
        FROM "Batch"
        JOIN "Product" ON "Batch"."productId" = "Product"."id"
        WHERE "Batch"."oid" = ${oid}
        GROUP BY "Batch"."warehouseId";
    `)
    return data.map((i) => ({
      warehouseId: i.warehouseId,
      sumCostAmount: Number(i.sumCostAmount),
      sumRetailAmount: Number(i.sumRetailAmount),
    }))
  }

  async topProductHighMoney(options: {
    oid: number
    limit: number
    orderBy: 'quantity' | 'costAmount' | 'retailAmount'
  }) {
    const { oid, limit, orderBy } = options
    const data: any[] = await this.manager.query(`
        SELECT 
            "Product".*,
            ("Product"."retailPrice" * "Product"."quantity") AS "retailAmount",
            SUM("Batch"."quantity" * "Batch"."costPrice") AS "costAmount"
        FROM "Product"
        JOIN "Batch" ON "Product"."id" = "Batch"."productId"
        WHERE "Product"."oid" = ${oid}
        GROUP BY "Product"."id"
        ORDER BY "${orderBy}" DESC
        LIMIT ${limit};
    `)
    return data.map((i) => ({
      ...i,
      retailAmount: Number(i.retailAmount),
      costAmount: Number(i.costAmount),
    }))
  }

  async topCustomerBestTicket(options: {
    oid: number
    fromTime: Date
    toTime: Date
    limit: number
    orderBy: 'sumTotalMoney' | 'sumProfit' | 'countTicket'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options
    const whereTicket: FindOptionsWhere<Ticket> = {
      oid,
      startedAt: Between(fromTime.getTime(), toTime.getTime()),
      status: In([TicketStatus.Debt, TicketStatus.Completed]),
    }
    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where(whereTicket)
      .groupBy('"ticket"."customerId"')
      .select('"ticket"."customerId"', 'customerId')
      .addSelect('SUM("ticket"."itemsCostAmount")', 'sumItemsCostAmount')
      .addSelect('SUM("ticket"."expense")', 'sumExpense')
      .addSelect('SUM("ticket"."surcharge")', 'sumSurcharge')
      .addSelect('SUM("ticket"."totalMoney")', 'sumTotalMoney')
      .addSelect('SUM("ticket"."debt")', 'sumDebt')
      .addSelect('SUM("ticket"."profit")', 'sumProfit')
      .addSelect('COUNT(*)', 'countTicket')
      .limit(limit)

    if (orderBy === 'sumTotalMoney') {
      query = query.orderBy('"sumTotalMoney"', 'DESC')
    } else if (orderBy === 'sumProfit') {
      query = query.orderBy('"sumProfit"', 'DESC')
    } else if (orderBy === 'countTicket') {
      query = query.orderBy('"countTicket"', 'DESC')
    }

    const data = await query.getRawMany()
    return data.map((i) => ({
      customerId: i.customerId as number,
      sumItemsCostAmount: Number(i.sumItemsCostAmount),
      sumExpense: Number(i.sumExpense),
      sumSurcharge: Number(i.sumSurcharge),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumDebt: Number(i.sumDebt),
      sumProfit: Number(i.sumProfit),
      countTicket: Number(i.countTicket),
    }))
  }
}
