import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, InvoiceStatus } from '../common/variable'
import CustomerPayment from './customer-payment.entity'
import Customer from './customer.entity'
import InvoiceExpense from './invoice-expense.entity'
import InvoiceItem from './invoice-item.entity'
import InvoiceSurcharge from './invoice-surcharge.entity'

@Entity('Invoice')
@Index('IDX_Invoice__oid_customerId', ['oid', 'customerId'])
@Index('IDX_Invoice__oid_time', ['oid', 'time'])
export default class Invoice extends BaseEntity {
  @Column({ default: 0 })
  @Expose()
  arrivalId: number

  @Column({ nullable: false })
  @Expose()
  customerId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  status: InvoiceStatus

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  time: number

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Expose()
  shipTime: Date

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  shipYear: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  shipMonth: number // 01->12

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  shipDate: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  deleteTime: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  itemsCostMoney: number // tổng tiền cost = tổng cost sản phẩm

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  itemsActualMoney: number // totalItemProduct + totalItemProcedure

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number // tiền giảm giá

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ type: 'varchar', length: 255, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    default: 0,
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  surcharge: number // Phụ phí

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  revenue: number // Doanh thu = itemsActualMoney + phụ phí - tiền giảm giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  }) // Chi phí (người bán trả): Ví dụ: chi phí ship người bán trả, chi phí thuê người trông, tiền vé xe ...
  @Expose() // Mục này sinh ra để tính lãi cho chính xác, nghĩa là để trừ cả các chi phí sinh ra khi tạo đơn
  expense: number // Mục này sẽ không hiện trong đơn hàng, khách hàng ko nhìn thấy

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  profit: number // tiền lãi = Doanh thu - Tiền cost - Chi phí

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paid: number // tiền đã thanh toán

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number // tiền nợ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  // @Expose({ name: 'arrival' })
  // @ManyToOne((type) => Arrival, { createForeignKeyConstraints: false })
  // @JoinColumn({ name: 'arrival_id', referencedColumnName: 'id' })
  // arrival: Arrival

  @Expose()
  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoiceItems: InvoiceItem[]

  @Expose()
  @OneToMany(() => InvoiceExpense, (invoiceExpense) => invoiceExpense.invoice)
  invoiceExpenses: InvoiceExpense[]

  @Expose()
  @OneToMany(() => InvoiceSurcharge, (invoiceSurcharge) => invoiceSurcharge.invoice)
  invoiceSurcharges: InvoiceSurcharge[]

  @Expose()
  @OneToMany(() => CustomerPayment, (customerPayment) => customerPayment.invoice)
  customerPayments: CustomerPayment[]
}
