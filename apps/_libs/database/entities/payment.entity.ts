import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import PaymentTicketItem from './payment-ticket-item.entity'
import PurchaseOrder from './purchase-order.entity'
import Ticket from './ticket.entity'
import User from './user.entity'
import Wallet from './wallet.entity'

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
  PaymentMoney = 1, // Thanh toán
  RefundMoney = 2, // Hoàn tiền
  Debit = 3, // Ghi nợ
  CancelDebt = 4, // Hủy nợ
  PayDebt = 5, // Trả nợ
  Close = 6, // Đóng phiếu
  Terminal = 7, // Hủy phiếu
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
@Index('IDX_Payment__oid_walletId', ['oid', 'walletId'])
export default class Payment {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'smallint', default: PaymentVoucherType.Other })
  @Expose()
  voucherType: PaymentVoucherType

  @Column({ type: 'bigint', default: 0 }) // ticketId hoặc purchaseOrderId
  @Expose()
  voucherId: string

  @Column({ type: 'smallint', default: PaymentPersonType.Other })
  @Expose()
  personType: PaymentPersonType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  personId: number

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  walletId: string

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
  paid: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paidItem: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debtItem: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  personOpenDebt: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  personCloseDebt: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  walletOpenMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  walletCloseMoney: number

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
  @ManyToOne((type) => Wallet, (wallet) => wallet.paymentList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
  wallet: Wallet

  static fromRaw(raw: { [P in keyof Payment]: any }) {
    if (!raw) return null
    const entity = new Payment()
    Object.assign(entity, raw)

    entity.createdAt = Number(raw.createdAt)
    entity.paid = Number(raw.paid)
    entity.paidItem = Number(raw.paidItem)
    entity.debt = Number(raw.debt)
    entity.debtItem = Number(raw.debtItem)
    entity.personOpenDebt = Number(raw.personOpenDebt)
    entity.personCloseDebt = Number(raw.personCloseDebt)
    entity.walletOpenMoney = Number(raw.walletOpenMoney)
    entity.walletCloseMoney = Number(raw.walletCloseMoney)

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
    | 'wallet'
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
