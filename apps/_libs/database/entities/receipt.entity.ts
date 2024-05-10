import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, ReceiptStatus } from '../common/variable'
import DistributorPayment from './distributor-payment.entity'
import Distributor from './distributor.entity'
import ReceiptItem from './receipt-item.entity'

@Entity('Receipt')
@Index('IDX_Receipt__oid_distributorId', ['oid', 'distributorId'])
@Index('IDX_Receipt__oid_startedAt', ['oid', 'startedAt'])
export default class Receipt extends BaseEntity {
  @Column()
  @Expose()
  distributorId: number

  @Column({ type: 'smallint' })
  @Expose()
  status: ReceiptStatus

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
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  itemsActualMoney: number // tiền sản phẩm

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
    name: 'surcharge',
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  surcharge: number // phụ phí: tiền phải trả thêm: như tiền ship, tiền vé, hao phí xăng dầu

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  revenue: number // tổng tiền = tiền sản phẩm + surcharge - tiền giảm giá

  @Column({
    name: 'paid',
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paid: number // tiền thanh toán

  @Column({
    name: 'debt',
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number // tiền nợ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  startedAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  shippedAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  deletedAt: number

  @Expose()
  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.receipt)
  receiptItems: ReceiptItem[]

  @Expose()
  @ManyToOne((type) => Distributor, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'distributorId', referencedColumnName: 'id' })
  distributor: Distributor

  @Expose()
  @OneToMany(() => DistributorPayment, (distributorPayment) => distributorPayment.receipt)
  distributorPayments: DistributorPayment[]
}
