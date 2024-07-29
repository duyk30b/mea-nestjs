import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { VoucherType } from '../../common/variable'
import { Customer, ProductMovement, Ticket } from '../../entities'
import { TicketStatus } from '../../entities/ticket.entity'

@Injectable()
export class StatisticRepository {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async sumWarehouse(oid: number): Promise<{ totalCostAmount: string; totalRetailMoney: string }> {
    const data: any[] = await this.manager.query(`
            SELECT SUM("costAmount") AS "totalCostAmount",
                SUM("retailPrice" * "quantity") AS "totalRetailMoney"
            FROM "Product"
            WHERE "oid" = ${oid}
        `)
    return data[0]
  }

  async topProductHighMoney(options: {
    oid: number
    limit: number
    orderBy: 'sumRetailMoney' | 'quantity' | 'costAmount'
  }) {
    const { oid, limit, orderBy } = options
    const data: any[] = await this.manager.query(`
            SELECT *,
                ("retailPrice" * "quantity") AS "sumRetailMoney"
            FROM "Product"
            WHERE "oid" = ${oid}
            ORDER BY "${orderBy}" DESC
            LIMIT ${limit}
        `)

    return data
  }

  async sumCustomerDebt(oid: number): Promise<number> {
    const { sum } = await this.manager
      .createQueryBuilder(Customer, 'customer')
      .select('SUM(debt)', 'sum')
      .where({ oid })
      .getRawOne()
    return Number(sum)
  }

  async topProductBestSelling(options: {
    oid: number
    fromTime: number
    toTime: number
    limit: number
    orderBy: 'sumActualMoney' | 'sumProfit' | 'sumQuantity'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options

    let query = this.manager
      .createQueryBuilder(ProductMovement, 'productMovement')
      .where('"productMovement".oid = :oid', { oid })
      .andWhere(`"productMovement"."voucherType" IN (${VoucherType.Ticket})`)
      .andWhere('"productMovement"."createdAt" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
      .groupBy('"productMovement"."productId"')
      .select('"productMovement"."productId"', 'productId')
      .addSelect('SUM(-"productMovement"."quantity")', 'sumQuantity')
      .addSelect(
        'SUM(-"productMovement"."quantity" * "productMovement"."actualPrice")',
        'sumActualMoney'
      )
      .addSelect('SUM(-"productMovement"."costAmount")', 'sumCostAmount')
      .addSelect(
        'SUM((-"productMovement".quantity) * "productMovement"."actualPrice" - (-"productMovement"."costAmount"))',
        'sumProfit'
      )
      .limit(limit)

    if (orderBy === 'sumActualMoney') {
      query = query.orderBy('"sumActualMoney"', 'DESC')
    } else if (orderBy === 'sumProfit') {
      query = query.orderBy('"sumProfit"', 'DESC')
    } else if (orderBy === 'sumQuantity') {
      query = query.orderBy('"sumQuantity"', 'DESC')
    }

    const data = await query.getRawMany()

    return data.map((i) => ({
      productId: i.productId as number,
      sumQuantity: Number(i.sumQuantity),
      sumCostAmount: Number(i.sumCostAmount),
      sumActualMoney: Number(i.sumActualMoney),
      sumProfit: Number(i.sumProfit),
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
      ticketStatus: In([TicketStatus.Debt, TicketStatus.Completed]),
    }
    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where(whereTicket)
      .groupBy('"ticket"."customerId"')
      .select('"ticket"."customerId"', 'customerId')
      .addSelect('SUM("ticket"."totalCostAmount")', 'sumTotalCostAmount')
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
      sumTotalCostAmount: Number(i.sumTotalCostAmount),
      sumItemActual: Number(i.sumItemActual),
      sumExpense: Number(i.sumExpense),
      sumSurcharge: Number(i.sumSurcharge),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumDebt: Number(i.sumDebt),
      sumProfit: Number(i.sumProfit),
      countTicket: Number(i.countTicket),
    }))
  }
}
