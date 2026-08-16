import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import PaymentPurchaseOrder from './payment_purchase_order.entity'
import PaymentTicket from './payment_ticket.entity'
import User from './user.entity'
import Wallet from './wallet.entity'

export enum PaymentPersonType {
  Other = 0,
  Distributor = 1, // PurchaseOrder
  Customer = 2, // Ticket
  Employee = 3,
}

export enum PaymentActionType {
  PaymentMoney = 1, // Thanh toán
  RefundMoney = 2, // Hoàn tiền
  Debit = 3, // Ghi nợ
  PayDebt = 4, // Trả nợ
  RefundDebt = 5, // Hủy nợ
  FixCustomerByExcel = 6, // Sửa customer bằng excel
  FixWallet = 7, // Sửa ví
  UserCreate = 8, // Tạo phiếu thanh toán
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

  @Column({ type: 'smallint', default: PaymentPersonType.Other })
  @Expose()
  personType: PaymentPersonType

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  personId: number

  @Column({ default: 0 }) // thu ngân viên thực hiện giao dịch
  @Expose()
  cashierId: number

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  walletId: string

  @Column({ type: 'smallint' })
  @Expose()
  paymentActionType: PaymentActionType

  @Column({ type: 'smallint' })
  @Expose()
  moneyDirection: MoneyDirection

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Column({ default: 0 })
  @Expose()
  paidTotal: number // tổng tiền thanh toán, + là tiền vào, - là tiền ra

  @Column({ default: 0 })
  @Expose()
  debtTotal: number // tổng tiền nợ

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
  customer: Customer

  @Expose()
  distributor: Distributor

  @Expose()
  employee: User

  @Expose()
  cashier: User

  @Expose()
  paymentTicketList: PaymentTicket[]

  @Expose()
  paymentPurchaseOrderList: PaymentPurchaseOrder[]

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
    entity.paidTotal = Number(raw.paidTotal)
    entity.debtTotal = Number(raw.debtTotal)
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
    | 'customer'
    | 'distributor'
    | 'employee'
    | 'wallet'
    | 'cashier'
    | 'paymentTicketList'
    | 'paymentPurchaseOrderList'
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
