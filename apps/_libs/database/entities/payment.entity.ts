import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import PaymentMethod from './payment-method.entity'
import Receipt from './receipt.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

export enum PaymentTiming {
  Other = 0, // Khác
  Prepayment = 1, // Thanh toán trước mua hàng
  ReceiveRefund = 2, // Nhận tiền hoàn trả
  Close = 3, // Thanh toán trực tiếp
  PayDebt = 4, // Trả nợ (thanh toán sau mua hàng )
  Reopen = 5, // Mở lại hồ sơ
  TopUp = 10, // Thanh toán để ghi quỹ (cộng vào quỹ của khách hàng)
}

export enum VoucherType {
  Unknown = 0,
  Receipt = 1,
  Ticket = 2,
}

export enum PersonType {
  Unknown = 0,
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
@Index('IDX_Payment__oid_voucherId', ['oid', 'voucherId'])
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

  @Column({ type: 'smallint', default: VoucherType.Unknown })
  @Expose()
  voucherType: VoucherType

  @Column({ default: 0 }) // ticketId hoặc receiptId
  @Expose()
  voucherId: number

  @Column({ type: 'smallint', default: PersonType.Unknown })
  @Expose()
  personType: PersonType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  personId: number

  @Column({ type: 'smallint', default: PaymentTiming.TopUp })
  @Expose()
  paymentTiming: PaymentTiming

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
  paidAmount: number // Số tiền thu

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // Thanh toán trước không ghi nợ: debit = 0
  debtAmount: number // Ghi nợ: tiền nợ thêm hoặc trả nợ

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openDebt: number // Công nợ đầu kỳ

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // openDebt + debtAmount = closeDebt
  closeDebt: number // Công nợ cuối kỳ

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  cashierId: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  description: string

  @Expose()
  customer: Customer

  @Expose()
  distributor: Distributor

  @Expose()
  employee: User

  @Expose()
  ticket: Ticket

  @Expose()
  receipt: Receipt

  @Expose()
  cashier: User

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
    entity.paidAmount = Number(raw.paidAmount)
    entity.debtAmount = Number(raw.debtAmount)
    entity.openDebt = Number(raw.openDebt)
    entity.closeDebt = Number(raw.closeDebt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Payment]: any }[]) {
    return raws.map((i) => Payment.fromRaw(i))
  }
}

export type PaymentRelationType = {
  [P in keyof Pick<
    Payment,
    'customer' | 'distributor' | 'employee' | 'ticket' | 'receipt' | 'paymentMethod' | 'cashier'
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
