import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { Ticket } from '../../entities'
import { TicketStatus, TicketType } from '../../entities/ticket.entity'

@Injectable()
export class StatisticTicketRepository {
  constructor(@InjectEntityManager() private manager: EntityManager) { }

  async statisticTicket(options: {
    oid: number
    fromTime: Date
    toTime: Date
    timeType: 'date' | 'month'
    ticketType?: TicketType
  }) {
    const { oid, timeType, ticketType } = options
    const fromTime = options.fromTime.getTime()
    const toTime = options.toTime.getTime()

    const whereTicket: FindOptionsWhere<Ticket> = {
      oid,
      ticketStatus: In([TicketStatus.Debt, TicketStatus.Completed]),
      endedAt: Between(fromTime, toTime),
    }
    if (ticketType) {
      whereTicket.ticketType = ticketType
    }

    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where(whereTicket)
      .select([
        'SUM("totalCostAmount") AS "sumTotalCostAmount"',
        'SUM("proceduresMoney") AS "sumProceduresMoney"',
        'SUM("productsMoney") AS "sumProductsMoney"',
        'SUM("radiologyMoney") AS "sumRadiologyMoney"',
        'SUM("surcharge") AS "sumSurcharge"',
        'SUM("expense") AS "sumExpense"',
        'SUM("discountMoney") AS "sumDiscountMoney"',
        'SUM("totalMoney") AS "sumTotalMoney"',
        'SUM("profit") AS "sumProfit"',
        'SUM("debt") AS "sumDebt"',
        'COUNT(*) AS "countTicket"',
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
      sumRadiologyMoney: Number(i.sumRadiologyMoney),
      sumSurcharge: Number(i.sumSurcharge),
      sumExpense: Number(i.sumExpense),
      sumDiscountMoney: Number(i.sumDiscountMoney),
      sumTotalMoney: Number(i.sumTotalMoney),
      sumProfit: Number(i.sumProfit),
      sumDebt: Number(i.sumDebt),
      countTicket: Number(i.countTicket),
    }))
  }

  // async statisticInvoiceExpense(options: {
  //   oid: number
  //   fromTime: Date
  //   toTime: Date
  //   timeType: 'date' | 'month'
  // }) {
  //   const { oid, timeType } = options
  //   const fromTime = options.fromTime.getTime()
  //   const toTime = options.toTime.getTime()

  //   let query = this.manager
  //     .createQueryBuilder(InvoiceExpense, 'invoiceExpense')
  //     .leftJoinAndSelect('invoiceExpense.invoice', 'invoice')
  //     .where('"invoiceExpense"."oid" = :oid', { oid })
  //     .andWhere('"invoice"."status" IN (:...status)', {
  //       status: [InvoiceStatus.Debt, InvoiceStatus.Success],
  //     })
  //     .andWhere('"invoice"."endedAt" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
  //     .select([
  //       '"invoiceExpense"."key" as "key"',
  //       '"invoiceExpense"."name" as "name"',
  //       '"invoice"."year" AS "year"',
  //       '"invoice"."month" AS "month"',
  //       'SUM("invoiceExpense"."money") AS "sumMoney"',
  //     ])
  //     .groupBy('"invoiceExpense"."key"')
  //     .addGroupBy('"invoiceExpense"."name"')

  //   if (timeType === 'date') {
  //     query = query
  //       .addSelect('invoice.date', 'date')
  //       .addGroupBy('"year"')
  //       .addGroupBy('"month"')
  //       .addGroupBy('"date"')
  //   } else if (timeType === 'month') {
  //     query = query.addGroupBy('"year"').addGroupBy('"month"')
  //   }
  //   const data = await query.getRawMany()

  //   return data.map((i) => ({
  //     oid,
  //     year: i.year as number,
  //     month: i.month as number,
  //     date: i.date as number,
  //     sumMoney: Number(i.sumMoney),
  //     key: i.key as string,
  //     name: i.name as string,
  //   }))
  // }

  // async statisticInvoiceSurcharge(options: {
  //   oid: number
  //   fromTime: Date
  //   toTime: Date
  //   timeType: 'date' | 'month'
  // }) {
  //   const { oid, timeType } = options
  //   const fromTime = options.fromTime.getTime()
  //   const toTime = options.toTime.getTime()

  //   let query = this.manager
  //     .createQueryBuilder(InvoiceSurcharge, 'invoiceSurcharge')
  //     .leftJoinAndSelect('invoiceSurcharge.invoice', 'invoice')
  //     .where('"invoiceSurcharge"."oid" = :oid', { oid })
  //     .andWhere('"invoice"."status" IN (:...status)', {
  //       status: [InvoiceStatus.Debt, InvoiceStatus.Success],
  //     })
  //     .andWhere('"invoice"."startedAt" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
  //     .select([
  //       '"invoiceSurcharge"."key" as "key"',
  //       '"invoiceSurcharge"."name" as "name"',
  //       '"invoice"."year" AS "year"',
  //       '"invoice"."month" AS "month"',
  //       'SUM("invoiceSurcharge"."money") AS "sumMoney"',
  //     ])
  //     .groupBy('"invoiceSurcharge"."key"')
  //     .addGroupBy('"invoiceSurcharge"."name"')

  //   if (timeType === 'date') {
  //     query = query
  //       .addSelect('invoice.date', 'date')
  //       .addGroupBy('"year"')
  //       .addGroupBy('"month"')
  //       .addGroupBy('"date"')
  //   } else if (timeType === 'month') {
  //     query = query.addGroupBy('"year"').addGroupBy('"month"')
  //   }
  //   const data = await query.getRawMany()

  //   return data.map((i) => ({
  //     oid,
  //     year: i.year as number,
  //     month: i.month as number,
  //     date: i.date as number,
  //     sumMoney: Number(i.sumMoney),
  //     key: i.key as string,
  //     name: i.name as string,
  //   }))
  // }
}
