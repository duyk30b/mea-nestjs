import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { PaymentType } from '../common/variable'
import Receipt from './receipt.entity'

@Entity('DistributorPayment')
@Index('IDX_DistributorPayment__oid_distributorId', ['oid', 'distributorId'])
@Index('IDX_DistributorPayment__oid_receiptId', ['oid', 'receiptId'])
export default class DistributorPayment extends BaseEntity {
  @Column()
  @Expose()
  distributorId: number

  @Column()
  @Expose()
  receiptId: number

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
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  }) // Trả nợ thì: paid = 0 - debit
  @Expose() // VD: Đơn 1tr, paid = 300 ==> debit = 700
  paid: number // Số tiền thanh toán

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // Thanh toán trước không ghi nợ: debit = 0
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
  @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'receiptId', referencedColumnName: 'id' })
  receipt: Receipt
}

export type DistributorPaymentInsertType = Omit<DistributorPayment, 'id' | 'receipt'>
