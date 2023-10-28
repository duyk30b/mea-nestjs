import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { PaymentType } from '../common/variable'
import Invoice from './invoice.entity'

@Entity('CustomerPayment')
@Index('IDX_CustomerPayment__customerId', ['oid', 'customerId'])
@Index('IDX_CustomerPayment__invoiceId', ['oid', 'invoiceId'])
export default class CustomerPayment extends BaseEntity {
  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  invoiceId: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Column({ type: 'smallint' })
  @Expose()
  type: PaymentType

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
  customerOpenDebt: number // Công nợ đầu kỳ

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // openDebt + debit = closeDebt
  customerCloseDebt: number // Công nợ cuối kỳ

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  invoiceOpenDebt: number // Công nợ đầu kỳ

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // openDebt + debit = closeDebt
  invoiceCloseDebt: number // Công nợ cuối kỳ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  description: string

  @Expose()
  @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'invoiceId', referencedColumnName: 'id' })
  invoice: Invoice
}

export type CustomerPaymentInsertType = Omit<CustomerPayment, 'id' | 'invoice'>
