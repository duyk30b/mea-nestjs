import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { DiscountType } from '../common/variable'
import Payment from './payment.entity'
import TicketLaboratoryGroup from './ticket-laboratory-group.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketProduct from './ticket-product.entity'
import TicketRadiology from './ticket-radiology.entity'
import Ticket from './ticket.entity'

export enum TicketItemType {
  Other = 0, // Không xác định
  TicketRegimen = 1,
  TicketProcedure = 2,
  TicketProductConsumable = 3,
  TicketProductPrescription = 4,
  TicketLaboratory = 5,
  TicketRadiology = 6,
}

@Entity('PaymentTicketItem')
@Index('IDX_PaymentTicketItem__oid_paymentId', ['oid', 'paymentId'])
export default class PaymentTicketItem {
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

  @Column({ type: 'smallint', default: TicketItemType.Other })
  @Expose()
  ticketItemType: TicketItemType

  @Column({ type: 'bigint' }) // ticketId hoặc purchaseOrderId
  @Expose()
  ticketItemId: string

  @Column({ type: 'integer', default: 0 })
  @Expose()
  interactId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  sessionIndex: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number

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

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType

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

  @Expose()
  payment: Payment

  @Expose()
  ticket: Ticket

  @Expose()
  ticketProcedure: TicketProcedure

  @Expose()
  ticketProductConsumable: TicketProduct

  @Expose()
  ticketProductPrescription: TicketProduct

  @Expose()
  ticketLaboratoryGroup: TicketLaboratoryGroup

  @Expose()
  ticketRadiology: TicketRadiology

  static fromRaw(raw: { [P in keyof PaymentTicketItem]: any }) {
    if (!raw) return null
    const entity = new PaymentTicketItem()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    return entity
  }

  static fromRaws(raws: { [P in keyof PaymentTicketItem]: any }[]) {
    return raws.map((i) => PaymentTicketItem.fromRaw(i))
  }
}

export type PaymentTicketItemRelationType = {
  [P in keyof Pick<
    PaymentTicketItem,
    | 'payment'
    | 'ticket'
    | 'ticketProcedure'
    | 'ticketProductConsumable'
    | 'ticketProductPrescription'
    | 'ticketLaboratoryGroup'
    | 'ticketRadiology'
  >]?: boolean
}

export type PaymentTicketItemInsertType = Omit<
  PaymentTicketItem,
  keyof PaymentTicketItemRelationType | keyof Pick<PaymentTicketItem, 'id'>
>

export type PaymentTicketItemUpdateType = {
  [K in Exclude<
    keyof PaymentTicketItem,
    keyof PaymentTicketItemRelationType | keyof Pick<PaymentTicketItem, 'oid' | 'id'>
  >]: PaymentTicketItem[K] | (() => string)
}

export type PaymentTicketItemSortType = {
  [P in keyof Pick<PaymentTicketItem, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
