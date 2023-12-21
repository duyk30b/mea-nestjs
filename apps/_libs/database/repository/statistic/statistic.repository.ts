import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, EntityManager, In } from 'typeorm'
import { InvoiceItemType, InvoiceStatus, ReceiptStatus } from '../../common/variable'
import { Customer, Invoice, InvoiceExpense, InvoiceItem, InvoiceSurcharge, Receipt } from '../../entities'

@Injectable()
export class StatisticRepository {
    constructor(@InjectEntityManager() private manager: EntityManager) {}

    async sumWarehouse(oid: number): Promise<{ totalCostMoney: string; totalRetailMoney: string }> {
        const data: any[] = await this.manager.query(`
            SELECT SUM("costPrice" * "quantity") AS "totalCostMoney", 
                SUM("retailPrice" * "quantity") AS "totalRetailMoney"
            FROM "ProductBatch"
            WHERE "oid" = ${oid}
        `)
        return data[0]
    }

    async sumDebt(oid: number): Promise<number> {
        const { sum } = await this.manager
            .createQueryBuilder(Customer, 'customer')
            .select('SUM(debt)', 'sum')
            .where({ oid })
            .getRawOne()
        return Number(sum)
    }

    async topProductHighCostMoney(options: { oid: number; limit: number }) {
        const { oid, limit } = options
        const data: any[] = await this.manager.query(`
            SELECT "productId", 
                SUM("costPrice" * "quantity") AS "sumCostMoney", 
                SUM("retailPrice" * "quantity") AS "sumRetailMoney",
                SUM("quantity") AS "sumQuantity"
            FROM "ProductBatch"
            WHERE "oid" = ${oid}
            GROUP BY "productId"
            ORDER BY "sumCostMoney" DESC
            LIMIT ${limit}
        `)

        return data.map((i) => ({
            productId: i.productId as number,
            sumCostMoney: Number(i.sumCostMoney),
            sumRetailMoney: Number(i.sumRetailMoney),
            sumQuantity: Number(i.sumQuantity),
        }))
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
            .createQueryBuilder(InvoiceItem, 'invoiceItem')
            .leftJoinAndSelect('invoiceItem.invoice', 'invoice')
            .leftJoinAndSelect('invoiceItem.productBatch', 'productBatch')
            .where('invoiceItem.oid = :oid', { oid })
            .andWhere('invoiceItem.type = :typeProductBatch', {
                typeProductBatch: InvoiceItemType.ProductBatch,
            })
            .andWhere('invoice.time BETWEEN :fromTime AND :toTime', { fromTime, toTime })
            .andWhere('invoice.status IN (:...status)', { status: [InvoiceStatus.Debt, InvoiceStatus.Success] })
            .groupBy('productBatch.productId')
            .select('productBatch.productId', 'productId')
            .addSelect('SUM(invoiceItem.quantity)', 'sumQuantity')
            .addSelect('SUM(invoiceItem.quantity * invoiceItem.actualPrice)', 'sumActualMoney')
            .addSelect('SUM(invoiceItem.quantity * invoiceItem.costPrice)', 'sumCostMoney')
            .addSelect('SUM(invoiceItem.quantity * (invoiceItem.actualPrice - invoiceItem.costPrice))', 'sumProfit')
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
            sumCostMoney: Number(i.sumCostMoney),
            sumActualMoney: Number(i.sumActualMoney),
            sumProfit: Number(i.sumProfit),
        }))
    }

    async topProcedureBestSelling(options: {
        oid: number
        fromTime: number
        toTime: number
        limit: number
        orderBy: 'sumActualMoney' | 'sumProfit' | 'sumQuantity'
    }) {
        const { oid, fromTime, toTime, orderBy, limit } = options

        let query = this.manager
            .createQueryBuilder(InvoiceItem, 'invoiceItem')
            .leftJoinAndSelect('invoiceItem.invoice', 'invoice')
            .leftJoinAndSelect('invoiceItem.procedure', 'procedure')
            .where('invoiceItem.oid = :oid', { oid })
            .andWhere('invoiceItem.type = :typeProductBatch', {
                typeProductBatch: InvoiceItemType.Procedure,
            })
            .andWhere('invoice.time BETWEEN :fromTime AND :toTime', { fromTime, toTime })
            .andWhere('invoice.status IN (:...status)', { status: [InvoiceStatus.Debt, InvoiceStatus.Success] })
            .groupBy('procedure.id')
            .select('procedure.id', 'procedureId')
            .addSelect('procedure.name', 'procedureName')
            .addSelect('SUM(invoiceItem.quantity)', 'sumQuantity')
            .addSelect('SUM(invoiceItem.quantity * invoiceItem.actualPrice)', 'sumActualMoney')
            .addSelect('SUM(invoiceItem.quantity * invoiceItem.costPrice)', 'sumCostMoney')
            .addSelect('SUM(invoiceItem.quantity * (invoiceItem.actualPrice - invoiceItem.costPrice))', 'sumProfit')
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
            procedureId: i.procedureId as number,
            procedureName: i.procedureName as string,
            sumQuantity: Number(i.sumQuantity),
            sumCostMoney: Number(i.sumCostMoney),
            sumActualMoney: Number(i.sumActualMoney),
            sumProfit: Number(i.sumProfit),
        }))
    }

    async topCustomerBestInvoice(options: {
        oid: number
        fromTime: Date
        toTime: Date
        limit: number
        orderBy: 'sumRevenue' | 'sumProfit' | 'countInvoice'
    }) {
        const { oid, fromTime, toTime, orderBy, limit } = options
        let query = this.manager
            .createQueryBuilder(Invoice, 'invoice')
            .where({
                oid,
                time: Between(fromTime.getTime(), toTime.getTime()),
                status: In([InvoiceStatus.Debt, InvoiceStatus.Success]),
            })
            .groupBy('invoice.customerId')
            .select('invoice.customerId', 'customerId')
            .addSelect('SUM(invoice.itemsCostMoney)', 'sumItemCost')
            .addSelect('SUM(invoice.itemsActualMoney)', 'sumItemActual')
            .addSelect('SUM(invoice.expense)', 'sumExpense')
            .addSelect('SUM(invoice.revenue)', 'sumRevenue')
            .addSelect('SUM(invoice.debt)', 'sumDebt')
            .addSelect('SUM(invoice.profit)', 'sumProfit')
            .addSelect('COUNT(*)', 'countInvoice')
            .limit(limit)

        if (orderBy === 'sumRevenue') {
            query = query.orderBy('"sumRevenue"', 'DESC')
        } else if (orderBy === 'sumProfit') {
            query = query.orderBy('"sumProfit"', 'DESC')
        } else if (orderBy === 'countInvoice') {
            query = query.orderBy('"countInvoice"', 'DESC')
        }

        const data = await query.getRawMany()
        return data.map((i) => ({
            customerId: i.customerId as number,
            sumItemCost: Number(i.sumItemCost),
            sumItemActual: Number(i.sumItemActual),
            sumExpense: Number(i.sumExpense),
            sumRevenue: Number(i.sumRevenue),
            sumDebt: Number(i.sumDebt),
            sumProfit: Number(i.sumProfit),
            countInvoice: Number(i.countInvoice),
        }))
    }

    async sumMoneyInvoice(options: { oid: number; fromTime: Date; toTime: Date; timeType: 'date' | 'month' }) {
        const { oid, timeType } = options
        const fromTime = options.fromTime.getTime()
        const toTime = options.toTime.getTime()

        let query = this.manager
            .createQueryBuilder(Invoice, 'invoice')
            .where({
                oid,
                status: In([InvoiceStatus.Debt, InvoiceStatus.Success]),
                time: Between(fromTime, toTime),
            })
            .select([
                '"shipYear"',
                '"shipMonth"',
                'SUM("itemsCostMoney") AS "sumItemsCost"',
                'SUM("itemsActualMoney") AS "sumItemsActual"',
                'SUM("itemsActualMoney" - "itemsCostMoney") AS "sumItemsProfit"',
                'SUM("surcharge") AS "sumSurcharge"',
                'SUM("discountMoney") AS "sumDiscountMoney"',
                'SUM("expense") AS "sumExpense"',
                'SUM("revenue") AS "sumRevenue"',
                'SUM("profit") AS "sumProfit"',
                'SUM("debt") AS "sumDebt"',
                'COUNT(*) AS "countInvoice"',
            ])
        if (timeType === 'date') {
            query = query
                .addSelect('invoice.shipDate', 'shipDate')
                .groupBy('"shipYear"')
                .addGroupBy('"shipMonth"')
                .addGroupBy('"shipDate"')
        } else if (timeType === 'month') {
            query = query.groupBy('"shipYear"').addGroupBy('"shipMonth"')
        }

        const data = await query.getRawMany()
        return data.map((i) => ({
            oid,
            shipYear: i.shipYear as number,
            shipMonth: i.shipMonth as number,
            shipDate: i.shipDate as number,
            sumItemsCost: Number(i.sumItemsCost),
            sumItemsActual: Number(i.sumItemsActual),
            sumItemsProfit: Number(i.sumItemsProfit),
            sumSurcharge: Number(i.sumSurcharge),
            sumDiscountMoney: Number(i.sumDiscountMoney),
            sumExpense: Number(i.sumExpense),
            sumRevenue: Number(i.sumRevenue),
            sumProfit: Number(i.sumProfit),
            sumDebt: Number(i.sumDebt),
            countInvoice: Number(i.countInvoice),
        }))
    }

    async sumMoneyReceipt(options: { oid: number; fromTime: Date; toTime: Date; timeType: 'date' | 'month' }) {
        const { oid, timeType } = options
        const fromTime = options.fromTime.getTime()
        const toTime = options.toTime.getTime()

        let query = this.manager
            .createQueryBuilder(Receipt, 'receipt')
            .where({
                oid,
                status: In([ReceiptStatus.Debt, ReceiptStatus.Success]),
                time: Between(fromTime, toTime),
            })
            .select(['"shipYear"', '"shipMonth"', 'SUM("revenue") AS "sumRevenue"', 'COUNT(*) AS "countReceipt"'])

        if (timeType === 'date') {
            query = query
                .addSelect('receipt.shipDate', 'shipDate')
                .groupBy('"shipYear"')
                .addGroupBy('"shipMonth"')
                .addGroupBy('"shipDate"')
        } else if (timeType === 'month') {
            query = query.groupBy('"shipYear"').addGroupBy('"shipMonth"')
        }

        const dataList = await query.getRawMany()

        return dataList.map((i) => ({
            oid,
            shipYear: i.shipYear as number,
            shipMonth: i.shipMonth as number,
            shipDate: i.shipDate as number,
            sumRevenue: Number(i.sumRevenue),
            countReceipt: Number(i.countReceipt),
        }))
    }

    async sumInvoiceExpense(options: { oid: number; fromTime: Date; toTime: Date; timeType: 'date' | 'month' }) {
        const { oid, timeType } = options
        const fromTime = options.fromTime.getTime()
        const toTime = options.toTime.getTime()

        let query = this.manager
            .createQueryBuilder(InvoiceExpense, 'invoiceExpense')
            .leftJoinAndSelect('invoiceExpense.invoice', 'invoice')
            .where('"invoiceExpense"."oid" = :oid', { oid })
            .andWhere('"invoice"."status" IN (:...status)', { status: [InvoiceStatus.Debt, InvoiceStatus.Success] })
            .andWhere('"invoice"."time" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
            .select([
                '"invoiceExpense"."key" as "key"',
                '"invoiceExpense"."name" as "name"',
                '"invoice"."shipYear" AS "shipYear"',
                '"invoice"."shipMonth" AS "shipMonth"',
                'SUM("invoiceExpense"."money") AS "sumMoney"',
            ])
            .groupBy('"invoiceExpense"."key"')
            .addGroupBy('"invoiceExpense"."name"')

        if (timeType === 'date') {
            query = query
                .addSelect('invoice.shipDate', 'shipDate')
                .addGroupBy('"shipYear"')
                .addGroupBy('"shipMonth"')
                .addGroupBy('"shipDate"')
        } else if (timeType === 'month') {
            query = query.addGroupBy('"shipYear"').addGroupBy('"shipMonth"')
        }
        const data = await query.getRawMany()

        return data.map((i) => ({
            oid,
            shipYear: i.shipYear as number,
            shipMonth: i.shipMonth as number,
            shipDate: i.shipDate as number,
            sumMoney: Number(i.sumMoney),
            key: i.key as string,
            name: i.name as string,
        }))
    }

    async sumInvoiceSurcharge(options: { oid: number; fromTime: Date; toTime: Date; timeType: 'date' | 'month' }) {
        const { oid, timeType } = options
        const fromTime = options.fromTime.getTime()
        const toTime = options.toTime.getTime()

        let query = this.manager
            .createQueryBuilder(InvoiceSurcharge, 'invoiceSurcharge')
            .leftJoinAndSelect('invoiceSurcharge.invoice', 'invoice')
            .where('"invoiceSurcharge"."oid" = :oid', { oid })
            .andWhere('"invoice"."status" IN (:...status)', { status: [InvoiceStatus.Debt, InvoiceStatus.Success] })
            .andWhere('"invoice"."time" BETWEEN :fromTime AND :toTime', { fromTime, toTime })
            .select([
                '"invoiceSurcharge"."key" as "key"',
                '"invoiceSurcharge"."name" as "name"',
                '"invoice"."shipYear" AS "shipYear"',
                '"invoice"."shipMonth" AS "shipMonth"',
                'SUM("invoiceSurcharge"."money") AS "sumMoney"',
            ])
            .groupBy('"invoiceSurcharge"."key"')
            .addGroupBy('"invoiceSurcharge"."name"')

        if (timeType === 'date') {
            query = query
                .addSelect('invoice.shipDate', 'shipDate')
                .addGroupBy('"shipYear"')
                .addGroupBy('"shipMonth"')
                .addGroupBy('"shipDate"')
        } else if (timeType === 'month') {
            query = query.addGroupBy('"shipYear"').addGroupBy('"shipMonth"')
        }
        const data = await query.getRawMany()

        return data.map((i) => ({
            oid,
            shipYear: i.shipYear as number,
            shipMonth: i.shipMonth as number,
            shipDate: i.shipDate as number,
            sumMoney: Number(i.sumMoney),
            key: i.key as string,
            name: i.name as string,
        }))
    }
}
