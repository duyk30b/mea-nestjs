import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DeliveryStatus, DiscountType } from '../common/variable'
import Distributor from './distributor.entity'
import Payment from './payment.entity'
import ReceiptItem from './receipt-item.entity'

export enum ReceiptStatus {
  Schedule = 1,
  Draft = 2,
  Deposited = 3,
  Executing = 4,
  Debt = 5,
  Completed = 6,
  Cancelled = 7,
}

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

  @Column({ type: 'smallint', default: DeliveryStatus.Pending })
  @Expose()
  deliveryStatus: DeliveryStatus

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  year: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  month: number // 01->12

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  date: number

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
  totalMoney: number // tổng tiền = tiền sản phẩm + surcharge - tiền giảm giá

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

  @Column({ type: 'varchar', length: 255, nullable: true })
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
  endedAt: number

  @Expose()
  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.receipt)
  receiptItemList: ReceiptItem[]

  @Expose()
  @ManyToOne((type) => Distributor, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'distributorId', referencedColumnName: 'id' })
  distributor: Distributor

  @Expose()
  @OneToMany(() => Payment, (payment) => payment.receipt)
  paymentList: Payment[]

  static fromRaw(raw: { [P in keyof Receipt]: any }) {
    if (!raw) return null
    const entity = new Receipt()
    Object.assign(entity, raw)

    entity.itemsActualMoney = Number(raw.itemsActualMoney)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)

    entity.surcharge = Number(raw.surcharge)
    entity.totalMoney = Number(raw.totalMoney)
    entity.paid = Number(raw.paid)
    entity.debt = Number(raw.debt)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    entity.endedAt = raw.endedAt == null ? raw.endedAt : Number(raw.endedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Receipt]: any }[]) {
    return raws.map((i) => Receipt.fromRaw(i))
  }
}

export type ReceiptRelationType = {
  [P in keyof Pick<Receipt, 'distributor' | 'paymentList'>]?: boolean
} & {
  [P in keyof Pick<Receipt, 'receiptItemList'>]?:
  | { [P in keyof Pick<ReceiptItem, 'product' | 'batch'>]?: boolean }
  | false
}

export type ReceiptInsertType = Omit<Receipt, keyof ReceiptRelationType | keyof Pick<Receipt, 'id'>>

export type ReceiptUpdateType = {
  [K in Exclude<keyof Receipt, keyof ReceiptRelationType | keyof Pick<Receipt, 'oid' | 'id'>>]:
  | Receipt[K]
  | (() => string)
}

export type ReceiptSortType = {
  [P in keyof Pick<Receipt, 'id' | 'distributorId' | 'startedAt'>]?: 'ASC' | 'DESC'
}
