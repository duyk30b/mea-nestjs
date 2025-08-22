import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import PaymentMethod from './payment-method.entity'
import PaymentTicketItem from './payment-ticket-item.entity'
import PurchaseOrder from './purchase-order.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

export enum PaymentPersonType {
  Other = 0,
  Distributor = 1,
  Customer = 2,
  Employee = 3,
}

export enum PaymentVoucherType {
  Other = 0, // Không xác định
  PurchaseOrder = 1,
  Ticket = 2,
}

export enum PaymentActionType {
  Other = 0, // Tạm ứng
  PrepaymentMoney = 1, // Tạm ứng
  RefundMoney = 2, // Hoàn trả tiền
  PayDebt = 3, // Trả nợ
  Close = 4, // Đóng phiếu, thường chỉ có thể ghi nợ khi đóng phiếu
  Reopen = 5, // Mở lại phiếu, thường thì chỉ có thể là hoàn trả nợ
  PrepaymentForTicketItemList = 6,
  RefundForTicketItemList = 7,
  FixByExcel = 8,
}

export enum MoneyDirection {
  Other = 0,
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

  @Column({ type: 'smallint', default: PaymentVoucherType.Other })
  @Expose()
  voucherType: PaymentVoucherType

  @Column({ default: 0 }) // ticketId hoặc purchaseOrderId
  @Expose()
  voucherId: number

  @Column({ type: 'smallint', default: PaymentPersonType.Other })
  @Expose()
  personType: PaymentPersonType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  personId: number

  @Column({ default: 0 })
  @Expose()
  paymentMethodId: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Column({ type: 'smallint' })
  @Expose()
  moneyDirection: MoneyDirection

  @Column({ type: 'smallint' })
  @Expose()
  paymentActionType: PaymentActionType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  cashierId: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paidAmount: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debtAmount: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openDebt: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeDebt: number

  @Expose()
  ticket: Ticket

  @Expose()
  purchaseOrder: PurchaseOrder

  @Expose()
  customer: Customer

  @Expose()
  distributor: Distributor

  @Expose()
  employee: User

  @Expose()
  cashier: User

  @Expose()
  paymentTicketItemList: PaymentTicketItem[]

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
    | 'ticket'
    | 'purchaseOrder'
    | 'customer'
    | 'distributor'
    | 'employee'
    | 'paymentMethod'
    | 'cashier'
    | 'paymentTicketItemList'
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
