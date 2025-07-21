import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import Payment, { PaymentPersonType } from './payment.entity'
import Receipt from './receipt.entity'
import TicketLaboratoryGroup from './ticket-laboratory-group.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketRadiology from './ticket-radiology.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

export enum PaymentVoucherType {
  Other = 0, // Không xác định
  Receipt = 1,
  Ticket = 2,
}

export enum PaymentVoucherItemType {
  Other = 0, // Không xác định
  TicketProcedure = 1,
  TicketProductConsumable = 2,
  TicketProductPrescription = 3,
  TicketLaboratory = 4,
  TicketRadiology = 5,
}

@Entity('PaymentItem')
@Index('IDX_PaymentItem__oid_createdAt', ['oid', 'createdAt'])
@Index('IDX_PaymentItem__oid_voucherId', ['oid', 'voucherId'])
@Index('IDX_PaymentItem__oid_personId', ['oid', 'personId'])
export default class PaymentItem {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ default: 0 })
  @Expose()
  paymentId: number

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

  @Column({ type: 'smallint', default: PaymentVoucherType.Other })
  @Expose()
  voucherType: PaymentVoucherType

  @Column({ default: 0 }) // ticketId hoặc receiptId
  @Expose()
  voucherId: number

  @Column({ type: 'smallint', default: PaymentVoucherItemType.Other })
  @Expose()
  voucherItemType: PaymentVoucherItemType

  @Column({ default: 0 }) // ticketId hoặc receiptId
  @Expose()
  voucherItemId: number

  @Column({ type: 'integer', default: 0 })
  @Expose()
  paymentInteractId: number

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
  @Expose() // VD: Đơn 1tr, moneyIn = 300 ==> debit = 700
  debtAmount: number // Số tiền thu

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // VD: Đơn 1tr, moneyIn = 300 ==> debit = 700
  openDebt: number // Số tiền thu

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose() // VD: Đơn 1tr, moneyIn = 300 ==> debit = 700
  closeDebt: number // Số tiền thu

  @Column({ default: 0 }) // distributorId hoặc customerId hoặc userId
  @Expose()
  cashierId: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

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
  payment: Payment

  @Expose()
  ticketProcedure: TicketProcedure

  @Expose()
  ticketLaboratoryGroup: TicketLaboratoryGroup

  @Expose()
  ticketRadiology: TicketRadiology

  static fromRaw(raw: { [P in keyof PaymentItem]: any }) {
    if (!raw) return null
    const entity = new PaymentItem()
    Object.assign(entity, raw)

    entity.createdAt = Number(raw.createdAt)
    entity.paidAmount = Number(raw.paidAmount)
    entity.debtAmount = Number(raw.debtAmount)
    entity.openDebt = Number(raw.openDebt)
    entity.closeDebt = Number(raw.closeDebt)

    return entity
  }

  static fromRaws(raws: { [P in keyof PaymentItem]: any }[]) {
    return raws.map((i) => PaymentItem.fromRaw(i))
  }
}

export type PaymentItemRelationType = {
  [P in keyof Pick<
    PaymentItem,
    | 'payment'
    | 'customer'
    | 'distributor'
    | 'employee'
    | 'ticket'
    | 'receipt'
    | 'ticketProcedure'
    | 'ticketLaboratoryGroup'
    | 'ticketRadiology'
  >]?: boolean
}

export type PaymentItemInsertType = Omit<
  PaymentItem,
  keyof PaymentItemRelationType | keyof Pick<PaymentItem, 'id'>
>

export type PaymentItemUpdateType = {
  [K in Exclude<
    keyof PaymentItem,
    keyof PaymentItemRelationType | keyof Pick<PaymentItem, 'oid' | 'id'>
  >]: PaymentItem[K] | (() => string)
}

export type PaymentItemSortType = {
  [P in keyof Pick<PaymentItem, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
