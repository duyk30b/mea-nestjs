import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { PaymentType, VoucherType } from '../common/variable'
import Customer from './customer.entity'
import Invoice from './invoice.entity'
import Visit from './visit.entity'

@Entity('CustomerPayment')
@Index('IDX_CustomerPayment__oid_customerId', ['oid', 'customerId'])
export default class CustomerPayment extends BaseEntity {
  @Column()
  @Expose()
  customerId: number

  @Column() // ID visit hoặc ID receipt
  @Expose()
  voucherId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  voucherType: VoucherType

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Column({ type: 'smallint' })
  @Expose()
  paymentType: PaymentType

  @Column({
    name: 'paid',
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  }) // Trả nợ thì: paid = 0 - debit
  @Expose({ name: 'paid' }) // VD: Đơn 1tr, paid = 300 ==> debit = 700
  paid: number // Số tiền thanh toán

  @Column({
    name: 'debit',
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose({ name: 'debit' }) // Thanh toán trước không ghi nợ: debit = 0
  debit: number // Ghi nợ: tiền nợ thêm hoặc trả nợ

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openDebt: number // Công nợ đầu kỳ

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // openDebt + debit = closeDebt
  closeDebt: number // Công nợ cuối kỳ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  description: string

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'voucherId', referencedColumnName: 'id' })
  invoice: Invoice

  @Expose()
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'voucherId', referencedColumnName: 'id' })
  visit: Visit

  static fromRaw(raw: { [P in keyof CustomerPayment]: any }) {
    if (!raw) return null
    const entity = new CustomerPayment()
    Object.assign(entity, raw)

    entity.createdAt = Number(raw.createdAt)
    entity.paid = Number(raw.paid)
    entity.debit = Number(raw.debit)
    entity.openDebt = Number(raw.openDebt)
    entity.closeDebt = Number(raw.closeDebt)

    return entity
  }

  static fromRaws(raws: { [P in keyof CustomerPayment]: any }[]) {
    return raws.map((i) => CustomerPayment.fromRaw(i))
  }
}

// import { ViewColumn, ViewEntity } from 'typeorm'

// @ViewEntity({
//   name: 'view_customer_payment',
//   expression: `
//       SELECT *,
//           TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime"
//       FROM "CustomerPayment";
//     `,
// })
// export class ViewCustomerPayment {}

export type CustomerPaymentRelationType = Pick<CustomerPayment, 'customer' | 'invoice' | 'visit'>

export type CustomerPaymentInsertType = Omit<
  CustomerPayment,
  'id' | keyof CustomerPaymentRelationType
>
