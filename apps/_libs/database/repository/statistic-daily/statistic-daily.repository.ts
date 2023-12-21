// import { Injectable } from '@nestjs/common'
// import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
// import { NoExtraProperties } from '../../../../common/src/helpers/typescript.helper'
// import { InvoiceStatus, ReceiptStatus } from '../../common/variable'
// import { Customer, Invoice, Organization, ProductBatch, Receipt, StatisticDaily } from '../../entities'
// import { Between, DataSource, EntityManager, FindOptionsWhere, In, Repository } from 'typeorm'
// import { StatisticDailyCondition, StatisticDailyOrder } from './statistic-daily.dto'

// @Injectable()
// export class StatisticDailyRepository {
//     constructor(
//         private dataSource: DataSource,
//         @InjectEntityManager() private manager: EntityManager,
//         @InjectRepository(StatisticDaily) private statisticDailyRepository: Repository<StatisticDaily>
//     ) { }

//     getWhereOptions(condition: StatisticDailyCondition = {}) {
//         const where: FindOptionsWhere<StatisticDaily> = {}

//         if (condition.id != null) where.id = condition.id
//         if (condition.oid != null) where.oid = condition.oid

//         if (condition.ids) {
//             if (condition.ids.length === 0) condition.ids.push(0)
//             where.id = In(condition.ids)
//         }

//         if (condition.time != null) {
//             if (typeof condition.time === 'number') {
//                 where.time = condition.time
//             }
//             else if (Array.isArray(condition.time)) {
//                 if (condition.time[0] === 'BETWEEN') {
//                     where.time = Between(
//                         condition.time[1].getTime(),
//                         condition.time[2].getTime()
//                     )
//                 }
//             }
//         }
//         return where
//     }

//     async pagination(options: {
//         page: number,
//         limit: number,
//         condition?: StatisticDailyCondition,
//         order?: StatisticDailyOrder
//     }) {
//         const { limit, page, condition, order } = options
//         const where = this.getWhereOptions(condition)

//         const [data, total] = await this.statisticDailyRepository.findAndCount({
//             where,
//             order,
//             take: limit,
//             skip: (page - 1) * limit,
//         })

//         return { total, page, limit, data }
//     }

//     async findMany(options: {
//         condition: StatisticDailyCondition,
//         limit?: number
//     }): Promise<StatisticDaily[]> {
//         const { condition, limit } = options
//         const where = this.getWhereOptions(condition)

//         const statisticDailyList = await this.statisticDailyRepository.find({
//             where,
//             take: limit ? limit : undefined,
//         })
//         return statisticDailyList
//     }

//     async insertOne<T extends Partial<StatisticDaily>>(dto: NoExtraProperties<Partial<StatisticDaily>, T>) {
//         const customer = this.statisticDailyRepository.create(dto)
//         return this.statisticDailyRepository.insert(customer)
//     }

//     async insertMany<T extends Partial<StatisticDaily>>(data: NoExtraProperties<Partial<StatisticDaily>, T>[]) {
//         const customersDto = this.statisticDailyRepository.create(data)
//         return this.statisticDailyRepository.insert(customersDto)
//     }

//     async statisticWarehouse(oid?: number) {
//         // const data: any[] = await this.manager.query(`
//         //     SELECT oid,
//         //         SUM(cost_price * quantity) AS warehouseCost,
//         //         SUM(retail_price * quantity) AS warehouseRetail
//         //     FROM product_batch
//         //     GROUP BY oid
//         // `)

//         const data: any[] = await this.manager.createQueryBuilder(ProductBatch, 'product_batch')
//             .where({ ...(oid ? { oid } : {}) })
//             .groupBy('oid')
//             .select([
//                 'oid',
//                 'SUM(cost_price * quantity) AS warehouseCost',
//                 'SUM(retail_price * quantity) AS warehouseRetail',
//             ])
//             .getRawMany()

//         return data.map((i) => ({
//             oid: Number(i.oid),
//             warehouseCost: Number(i.warehouseCost),
//             warehouseRetail: Number(i.warehouseRetail),
//         }))
//     }

//     async statisticCustomerDebt(oid?: number) {
//         const data: any[] = await this.manager.createQueryBuilder(Customer, 'customer')
//             .where({ ...(oid ? { oid } : {}) })
//             .groupBy('oid')
//             .select(['oid', 'SUM(debt) AS customerDebt'])
//             .getRawMany()

//         return data.map((i) => ({
//             oid: Number(i.oid),
//             customerDebt: Number(i.customerDebt),
//         }))
//     }

//     async statisticInvoice(options: { oid?: number, fromTime: Date, toTime: Date }) {
//         const { oid, fromTime, toTime } = options
//         const data: any[] = await this.manager.createQueryBuilder(Invoice, 'invoice')
//             .where({
//                 status: In([InvoiceStatus.Debt, InvoiceStatus.Success]),
//                 time: Between(fromTime.getTime(), toTime.getTime()),
//                 ...(oid ? { oid } : {}),
//             })
//             .select([
//                 'oid',
//                 'SUM(itemsCostMoney) AS invoiceItemCost',
//                 'SUM(itemsActualMoney) AS invoiceItemActual',
//                 'SUM(itemsActualMoney - itemsCostMoney) AS invoiceItemProfit',
//                 'SUM(surcharge) AS invoiceSurcharge',
//                 'SUM(expense) AS invoiceExpenses',
//                 'SUM(revenue) AS invoiceRevenue',
//                 'SUM(profit) AS invoiceProfit',
//                 'SUM(debt) AS invoiceDebt',
//                 'COUNT(*) AS invoiceCount',
//             ])
//             .groupBy('oid')
//             .getRawMany()

//         return data.map((i) => ({
//             oid: Number(i.oid),
//             invoiceItemCost: Number(i.invoiceItemCost),
//             invoiceItemActual: Number(i.invoiceItemActual),
//             invoiceItemProfit: Number(i.invoiceItemProfit),
//             invoiceSurcharge: Number(i.invoiceSurcharge),
//             invoiceExpenses: Number(i.invoiceExpenses),
//             invoiceRevenue: Number(i.invoiceRevenue),
//             invoiceProfit: Number(i.invoiceProfit),
//             invoiceDebt: Number(i.invoiceDebt),
//             invoiceCount: Number(i.invoiceCount),
//         }))
//     }

//     async statisticReceipt(options: { oid?: number, fromTime: Date, toTime: Date }) {
//         const { oid, fromTime, toTime } = options
//         const data: any[] = await this.manager.createQueryBuilder(Receipt, 'receipt')
//             .where({
//                 status: In([ReceiptStatus.Debt, ReceiptStatus.Success]),
//                 time: Between(fromTime.getTime(), toTime.getTime()),
//                 ...(oid ? { oid } : {}),
//             })
//             .select([
//                 'oid',
//                 'SUM(revenue) AS receiptRevenue',
//                 'COUNT(*) AS receiptCount',
//             ])
//             .groupBy('oid')
//             .getRawMany()

//         return data.map((i) => ({
//             oid: Number(i.oid),
//             receiptRevenue: Number(i.receiptRevenue),
//             receiptCount: Number(i.receiptCount),
//         }))
//     }

//     async createStatisticList(options: {
//         oid?: number,
//         type: 'Date' | 'Month'
//         fromTime: Date,
//         toTime: Date,
//         action: {
//             warehouse?: boolean, customerDebt?: boolean,
//             invoice?: boolean, receipt?: boolean
//         }
//     }) {
//         const { oid, fromTime, toTime, action, type } = options

//         const statisticDailyMap: Record<string, Partial<StatisticDaily>> = {}

//         const allOrganization = await this.manager.find(Organization, { where: { ...(oid ? { id: 2 } : {}) } })
//         allOrganization.forEach((org) => {
//             const statisticDaily = new StatisticDaily()
//             statisticDaily.oid = org.id
//             statisticDaily.type = type
//             statisticDaily.time = toTime.getTime()
//             statisticDaily.year = toTime.getUTCFullYear()
//             statisticDaily.month = toTime.getUTCMonth() + 1
//             statisticDaily.date = toTime.getUTCDate()

//             statisticDailyMap[org.id] = statisticDaily
//         })

//         const [statisticWarehouse, customerDebt, invoices, statisticReceipt] = await Promise.all([
//             action.warehouse ? this.statisticWarehouse(oid) : null,
//             action.customerDebt ? this.statisticCustomerDebt(oid) : null,
//             action.invoice ? this.manager.findBy(Invoice, {
//                 time: Between(fromTime.getTime(), toTime.getTime()),
//                 ...(oid ? { oid } : {}),
//             }) : null,
//             action.receipt ? this.statisticReceipt({ oid, fromTime, toTime }) : null,
//         ])

//         if (statisticWarehouse) {
//             statisticWarehouse.forEach((item) => {
//                 statisticDailyMap[item.oid].warehouseCost = item.warehouseCost
//                 statisticDailyMap[item.oid].warehouseRetail = item.warehouseRetail
//             })
//         }

//         if (customerDebt) {
//             customerDebt.forEach((item) => {
//                 statisticDailyMap[item.oid].customerDebt = item.customerDebt
//             })
//         }

//         if (invoices) {
//             invoices.forEach((invoice) => {
//                 statisticDailyMap[invoice.oid].invoiceItemCost += invoice.itemsCostMoney
//                 statisticDailyMap[invoice.oid].invoiceItemActual += invoice.itemsActualMoney
//                 statisticDailyMap[invoice.oid].invoiceItemProfit += (invoice.itemsActualMoney - invoice.itemsCostMoney)
//                 statisticDailyMap[invoice.oid].invoiceSurcharge += invoice.surcharge
//                 statisticDailyMap[invoice.oid].invoiceExpenses += invoice.expense
//                 statisticDailyMap[invoice.oid].invoiceRevenue += invoice.revenue
//                 statisticDailyMap[invoice.oid].invoiceProfit += invoice.profit
//                 statisticDailyMap[invoice.oid].invoiceDebt += invoice.debt
//                 statisticDailyMap[invoice.oid].invoiceCount++

//                 const { invoiceSurchargeDetails } = statisticDailyMap[invoice.oid]
//                 invoice.surchargeDetails.forEach((detail) => {
//                     const exist = invoiceSurchargeDetails.find((i) => i.key === detail.key)
//                     if (!exist) {
//                         invoiceSurchargeDetails.push({
//                             key: detail.key,
//                             name: detail.name,
//                             money: detail.money,
//                         })
//                     } else {
//                         exist.name = detail.name
//                         exist.money += detail.money
//                     }
//                 })

//                 const { invoiceExpensesDetails } = statisticDailyMap[invoice.oid]
//                 invoice.expensesDetails.forEach((detail) => {
//                     const exist = invoiceExpensesDetails.find((i) => i.key === detail.key)
//                     if (!exist) {
//                         invoiceExpensesDetails.push({
//                             key: detail.key,
//                             name: detail.name,
//                             money: detail.money,
//                         })
//                     } else {
//                         exist.name = detail.name
//                         exist.money += detail.money
//                     }
//                 })
//             })
//         }

//         if (statisticReceipt) {
//             statisticReceipt.forEach((item) => {
//                 statisticDailyMap[item.oid].receiptRevenue = item.receiptRevenue
//                 statisticDailyMap[item.oid].receiptCount = item.receiptCount
//             })
//         }

//         const statisticDailyList = Object.values(statisticDailyMap)

//         return statisticDailyList
//     }
// }
