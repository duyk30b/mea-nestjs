// import { Expose } from 'class-transformer'
// import { Column, Entity, Index } from 'typeorm'
// import { BaseEntity } from '../common/base.entity'
// import { ExpensesDetailType, SurchargeDetailType } from '../common/variable'

// @Entity('statistic_daily')
// @Index('IDX_STATISTIC_DAILY__OID_TYPE_TIME', ['oid', 'type', 'time'], { unique: true })
// export default class StatisticDaily extends BaseEntity {
//     @Column({ name: 'type', type: 'varchar' })
//     @Expose({ name: 'type' })
//     type: 'Date' | 'Month'

//     @Column({ name: 'year', type: 'smallint' })
//     @Expose({ name: 'year' })
//     year: number

//     @Column({ name: 'month', type: 'tinyint' })
//     @Expose({ name: 'month' })
//     month: number

//     @Column({ name: 'date', type: 'tinyint' })
//     @Expose({ name: 'date' })
//     date: number

//     @Column({
//         name: 'time',
//         type: 'bigint',
//         nullable: true,
//         transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
//     })
//     @Expose({ name: 'time' })
//     time: number

//     @Column({
//         name: 'warehouse_cost',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'warehouse_cost' })
//     warehouseCost = 0

//     @Column({
//         name: 'warehouse_retail',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'warehouse_retail' })
//     warehouseRetail = 0

//     @Column({
//         name: 'customer_debt',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'customer_debt' })
//     customerDebt = 0

//     @Column({
//         name: 'invoice_item_cost',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_item_cost' })
//     invoiceItemCost = 0

//     @Column({
//         name: 'invoice_item_profit',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_item_profit' })
//     invoiceItemProfit = 0

//     @Column({
//         name: 'invoice_item_actual',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_item_actual' })
//     invoiceItemActual = 0

//     @Column({
//         name: 'invoice_surcharge',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_surcharge' })
//     invoiceSurcharge = 0

//     @Column({
//         name: 'invoice_expenses',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_expenses' })
//     invoiceExpenses = 0

//     @Column({
//         name: 'invoice_revenue',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_revenue' })
//     invoiceRevenue = 0

//     @Column({
//         name: 'invoice_profit',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_profit' })
//     invoiceProfit = 0

//     @Column({
//         name: 'invoice_debt',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'invoice_debt' })
//     invoiceDebt = 0

//     @Column({ name: 'invoice_count', type: 'smallint', default: 0 })
//     @Expose({ name: 'invoice_count' })
//     invoiceCount = 0

//     @Column({ name: 'invoice_surcharge_details', type: 'simple-json', default: '[]' })
//     @Expose({ name: 'invoice_surcharge_details' })
//     invoiceSurchargeDetails: SurchargeDetailType[] = []

//     @Column({ name: 'invoice_expenses_details', type: 'simple-json', default: '[]' })
//     @Expose({ name: 'invoice_expenses_details' })
//     invoiceExpensesDetails: ExpensesDetailType[] = []

//     @Column({
//         name: 'receipt_revenue',
//         type: 'bigint',
//         default: 0,
//         transformer: { to: (value) => value, from: (value) => Number(value) },
//     })
//     @Expose({ name: 'receipt_revenue' })
//     receiptRevenue = 0

//     @Column({ name: 'receipt_count', type: 'smallint', default: 0 })
//     @Expose({ name: 'receipt_count' })
//     receiptCount = 0
// }
