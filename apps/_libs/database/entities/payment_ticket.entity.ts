import Laboratory from '@libs/database/entities/laboratory.entity'
import Procedure from '@libs/database/entities/procedure.entity'
import Product from '@libs/database/entities/product.entity'
import Radiology from '@libs/database/entities/radiology.entity'
import Regimen from '@libs/database/entities/regimen.entity'
import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { DiscountType, TicketActionType } from '../common/variable'
import Payment from './payment.entity'
import Ticket from './ticket.entity'

export enum PaymentTicketItemType {
  Unknown = 0, // Không xác định
  WAIT = 1, // Thanh toán vào tiền chờ
  Surcharge = 2,
  Discount = 3,
  TicketRegimen = 4,
  TicketProcedure = 5,
  TicketProductConsumable = 6,
  TicketProductPrescription = 7,
  TicketLaboratory = 8,
  TicketRadiology = 9,
}

@Entity('PaymentTicket')
@Index('IDX_PaymentTicket__oid_paymentId', ['oid', 'paymentId'])
@Index('IDX_PaymentTicket__oid_ticketId', ['oid', 'ticketId'])
export default class PaymentTicket {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  paymentId: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  ticketActionType: TicketActionType

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  paymentTicketItemType: PaymentTicketItemType

  @Column({ type: 'bigint' })
  @Expose()
  ticketItemId: string

  @Column({ type: 'integer', default: 0 })
  @Expose()
  ticketItemInteractId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  sessionIndex: number // ghi chú cho trường hợp liệu trình - ví dụ buổi 2, buổi 3, buổi 4, ...)

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number

  @Column({ default: 1 })
  @Expose()
  quantity: number

  @Column({ default: 1 })
  @Expose()
  unitRate: number

  @Column({ default: 0 })
  @Expose()
  paidMoney: number

  @Column({ default: 0 })
  @Expose()
  debtMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  payment: Payment

  @Expose()
  ticket: Ticket

  @Expose()
  regimen: Regimen

  @Expose()
  procedure: Procedure

  @Expose()
  product: Product

  @Expose()
  laboratory: Laboratory

  @Expose()
  radiology: Radiology

  static fromRaw(raw: { [P in keyof PaymentTicket]: any }) {
    if (!raw) return null
    const entity = new PaymentTicket()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof PaymentTicket]: any }[]) {
    return raws.map((i) => PaymentTicket.fromRaw(i))
  }
}

export type PaymentTicketRelationType = {
  [P in keyof Pick<
    PaymentTicket,
    'payment' | 'ticket' | 'regimen' | 'procedure' | 'product' | 'laboratory' | 'radiology'
  >]?: boolean
}

export type PaymentTicketInsertType = Omit<
  PaymentTicket,
  keyof PaymentTicketRelationType | keyof Pick<PaymentTicket, 'id'>
>

export type PaymentTicketUpdateType = {
  [K in Exclude<
    keyof PaymentTicket,
    keyof PaymentTicketRelationType | keyof Pick<PaymentTicket, 'oid' | 'id'>
  >]: PaymentTicket[K] | (() => string)
}

export type PaymentTicketSortType = {
  [P in keyof Pick<PaymentTicket, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
