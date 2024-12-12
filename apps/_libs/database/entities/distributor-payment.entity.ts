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

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  description: string

  @Expose()
  @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'receiptId', referencedColumnName: 'id' })
  receipt: Receipt

  static fromRaw(raw: { [P in keyof DistributorPayment]: any }) {
    if (!raw) return null
    const entity = new DistributorPayment()
    Object.assign(entity, raw)

    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)
    entity.paid = Number(raw.paid)
    entity.debit = Number(raw.debit)
    entity.openDebt = Number(raw.openDebt)
    entity.closeDebt = Number(raw.closeDebt)

    return entity
  }

  static fromRaws(raws: { [P in keyof DistributorPayment]: any }[]) {
    return raws.map((i) => DistributorPayment.fromRaw(i))
  }
}

export type DistributorPaymentRelationType = {
  [P in keyof Pick<DistributorPayment, 'receipt'>]?: boolean
}

export type DistributorPaymentInsertType = Omit<
  DistributorPayment,
  keyof DistributorPaymentRelationType | keyof Pick<DistributorPayment, 'id'>
>

export type DistributorPaymentUpdateType = {
  [K in Exclude<
    keyof DistributorPayment,
    | keyof DistributorPaymentRelationType
    | keyof Pick<DistributorPayment, 'oid' | 'id'>
  >]: DistributorPayment[K] | (() => string)
}

export type DistributorPaymentSortType = {
  [P in keyof Pick<DistributorPayment, 'id'>]?: 'ASC' | 'DESC'
}
