import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, DataSource, EntityManager, In } from 'typeorm'
import { InvoiceItemType, InvoiceStatus } from '../../common/variable'
import {
  Customer,
  Invoice,
  InvoiceItem,
  ProductMovement,
  Visit,
  VisitProcedure,
} from '../../entities'
import { VisitStatus } from '../../entities/visit.entity'

@Injectable()
export class StatisticRepository {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

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
        'SUM(-("productMovement".quantity * "productMovement"."actualPrice" - "productMovement"."costAmount"))',
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

  async topInvoiceProcedureBestSelling(options: {
    oid: number
    fromTime: number
    toTime: number
    limit: number
    orderBy: 'sumActualMoney' | 'sumQuantity'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options

    let query = this.manager
      .createQueryBuilder(InvoiceItem, 'invoiceItem')
      .leftJoinAndSelect('invoiceItem.invoice', 'invoice')
      .where('invoiceItem.oid = :oid', { oid })
      .andWhere('invoiceItem.type = :typeProcedure', {
        typeProcedure: InvoiceItemType.Procedure,
      })
      .andWhere('invoice.startedAt BETWEEN :fromTime AND :toTime', { fromTime, toTime })
      .andWhere('invoice.status IN (:...status)', {
        status: [InvoiceStatus.Debt, InvoiceStatus.Success],
      })
      .groupBy('"invoiceItem"."procedureId"')
      .select('"invoiceItem"."procedureId"', 'procedureId')
      .addSelect('SUM("invoiceItem".quantity)', 'sumQuantity')
      .addSelect('SUM("invoiceItem".quantity * "invoiceItem"."actualPrice")', 'sumActualMoney')
      .limit(limit)

    if (orderBy === 'sumActualMoney') {
      query = query.orderBy('"sumActualMoney"', 'DESC')
    } else if (orderBy === 'sumQuantity') {
      query = query.orderBy('"sumQuantity"', 'DESC')
    }

    const data = await query.getRawMany()

    return data.map((i) => ({
      procedureId: i.procedureId as number,
      sumQuantity: Number(i.sumQuantity),
      sumActualMoney: Number(i.sumActualMoney),
    }))
  }

  async topVisitProcedureBestSelling(options: {
    oid: number
    fromTime: number
    toTime: number
    limit: number
    orderBy: 'sumActualMoney' | 'sumQuantity'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options

    let query = this.manager
      .createQueryBuilder(VisitProcedure, 'visitProcedure')
      .where('visitProcedure.oid = :oid', { oid })
      .andWhere('"visitProcedure"."createdAt" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
      .groupBy('"visitProcedure"."procedureId"')
      .select('"visitProcedure"."procedureId"', 'procedureId')
      .addSelect('SUM("visitProcedure".quantity)', 'sumQuantity')
      .addSelect(
        'SUM("visitProcedure".quantity * "visitProcedure"."actualPrice")',
        'sumActualMoney'
      )
      .limit(limit)

    if (orderBy === 'sumActualMoney') {
      query = query.orderBy('"sumActualMoney"', 'DESC')
    } else if (orderBy === 'sumQuantity') {
      query = query.orderBy('"sumQuantity"', 'DESC')
    }

    const data = await query.getRawMany()

    return data.map((i) => ({
      procedureId: i.procedureId as number,
      sumQuantity: Number(i.sumQuantity),
      sumActualMoney: Number(i.sumActualMoney),
    }))
  }

  async topCustomerBestInvoice(options: {
    oid: number
    fromTime: Date
    toTime: Date
    limit: number
    orderBy: 'sumTotalMoney' | 'sumProfit' | 'countInvoice'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options
    let query = this.manager
      .createQueryBuilder(Invoice, 'invoice')
      .where({
        oid,
        startedAt: Between(fromTime.getTime(), toTime.getTime()),
        status: In([InvoiceStatus.Debt, InvoiceStatus.Success]),
      })
      .groupBy('"invoice"."customerId"')
      .select('"invoice"."customerId"', 'customerId')
      .addSelect('SUM("invoice"."totalCostAmount")', 'sumTotalCostAmount')
      .addSelect('SUM("invoice"."itemsActualMoney")', 'sumItemActual')
      .addSelect('SUM("invoice"."expense")', 'sumExpense')
      .addSelect('SUM("invoice"."totalMoney")', 'sumTotalMoney')
      .addSelect('SUM("invoice"."debt")', 'sumDebt')
      .addSelect('SUM("invoice"."profit")', 'sumProfit')
      .addSelect('COUNT(*)', 'countInvoice')
      .limit(limit)

    if (orderBy === 'sumTotalMoney') {
      query = query.orderBy('"sumTotalMoney"', 'DESC')
    } else if (orderBy === 'sumProfit') {
      query = query.orderBy('"sumProfit"', 'DESC')
    } else if (orderBy === 'countInvoice') {
      query = query.orderBy('"countInvoice"', 'DESC')
    }

    const data = await query.getRawMany()
    return data.map((i) => ({
      customerId: i.customerId as number,
      sumTotalCostAmount: Number(i.sumTotalCostAmount),
      sumItemActual: Number(i.sumItemActual),
      sumExpense: Number(i.sumExpense),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumDebt: Number(i.sumDebt),
      sumProfit: Number(i.sumProfit),
      countInvoice: Number(i.countInvoice),
    }))
  }

  async topCustomerBestVisit(options: {
    oid: number
    fromTime: Date
    toTime: Date
    limit: number
    orderBy: 'sumTotalMoney' | 'sumProfit' | 'countVisit'
  }) {
    const { oid, fromTime, toTime, orderBy, limit } = options
    let query = this.manager
      .createQueryBuilder(Visit, 'visit')
      .where({
        oid,
        startedAt: Between(fromTime.getTime(), toTime.getTime()),
        visitStatus: In([VisitStatus.Debt, VisitStatus.Completed]),
      })
      .groupBy('"visit"."customerId"')
      .select('"visit"."customerId"', 'customerId')
      .addSelect('SUM("visit"."totalCostAmount")', 'sumTotalCostAmount')
      .addSelect('SUM("visit"."totalMoney")', 'sumTotalMoney')
      .addSelect('SUM("visit"."debt")', 'sumDebt')
      .addSelect('SUM("visit"."profit")', 'sumProfit')
      .addSelect('COUNT(*)', 'countVisit')
      .limit(limit)

    if (orderBy === 'sumTotalMoney') {
      query = query.orderBy('"sumTotalMoney"', 'DESC')
    } else if (orderBy === 'sumProfit') {
      query = query.orderBy('"sumProfit"', 'DESC')
    } else if (orderBy === 'countVisit') {
      query = query.orderBy('"countVisit"', 'DESC')
    }

    const data = await query.getRawMany()
    return data.map((i) => ({
      customerId: i.customerId as number,
      sumTotalCostAmount: Number(i.sumTotalCostAmount),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumDebt: Number(i.sumDebt),
      sumProfit: Number(i.sumProfit),
      countVisit: Number(i.countVisit),
    }))
  }
}
