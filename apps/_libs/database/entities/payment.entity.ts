import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import PaymentItem from './payment-item.entity'
import PaymentMethod from './payment-method.entity'
import User from './user.entity'

export enum PaymentPersonType {
  Other = 0,
  Distributor = 1,
  Customer = 2,
  Employee = 3,
}

export enum MoneyDirection {
  In = 1,
  Out = 2,
}

@Entity('Payment')
@Index('IDX_Payment__oid_createdAt', ['oid', 'createdAt'])
@Index('IDX_Payment__oid_personId', ['oid', 'personId'])
@Index('IDX_Payment__oid_moneyDirection', ['oid', 'moneyDirection'])
@Index('IDX_Payment__oid_paymentMethodId', ['oid', 'paymentMethodId'])
export default class Payment {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ default: 0 })
  @Expose()
  paymentMethodId: number

  @Column({ type: 'smallint', default: PaymentPersonType.Other })
  @Expose()
  paymentPersonType: PaymentPersonType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  personId: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Column({ type: 'smallint' })
  @Expose()
  moneyDirection: MoneyDirection

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // VD: Đơn 1tr, moneyIn = 300 ==> debit = 700
  money: number // Số tiền thu

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  cashierId: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  reason: string

  @Expose()
  customer: Customer

  @Expose()
  distributor: Distributor

  @Expose()
  employee: User

  @Expose()
  cashier: User

  @Expose()
  paymentItemList: PaymentItem[]

  @Expose()
  @ManyToOne((type) => PaymentMethod, (paymentMethod) => paymentMethod.paymentList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'paymentMethodId', referencedColumnName: 'id' })
  paymentMethod: PaymentMethod

  static fromRaw(raw: { [P in keyof Payment]: any }) {
    if (!raw) return null
    const entity = new Payment()
    Object.assign(entity, raw)

    entity.createdAt = Number(raw.createdAt)
    entity.money = Number(raw.money)

    return entity
  }

  static fromRaws(raws: { [P in keyof Payment]: any }[]) {
    return raws.map((i) => Payment.fromRaw(i))
  }
}

export type PaymentRelationType = {
  [P in keyof Pick<
    Payment,
    'customer' | 'distributor' | 'employee' | 'paymentMethod' | 'cashier' | 'paymentItemList'
  >]?: boolean
}

export type PaymentInsertType = Omit<Payment, keyof PaymentRelationType | keyof Pick<Payment, 'id'>>

export type PaymentUpdateType = {
  [K in Exclude<keyof Payment, keyof PaymentRelationType | keyof Pick<Payment, 'oid' | 'id'>>]:
  | Payment[K]
  | (() => string)
}

export type PaymentSortType = {
  [P in keyof Pick<Payment, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
