import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { DiscountType, PaymentMoneyStatus } from '../common/variable'
import Customer from './customer.entity'
import Image from './image.entity'
import Procedure from './procedure.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

export enum TicketProcedureStatus {
  NoEffect = 1,
  Pending = 2,
  Completed = 3,
}

export enum TicketProcedureType {
  Normal = 1,
  InRegimen = 2,
}

@Entity('TicketProcedure')
@Index('IDX_TicketProcedure__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketProcedure__oid_customerId', ['oid', 'customerId'])
@Index('IDX_TicketProcedure__oid_procedureId', ['oid', 'procedureId'])
@Index('IDX_TicketProcedure__oid_createdAt', ['oid', 'createdAt'])
export default class TicketProcedure {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

  @Column({ type: 'smallint', default: TicketProcedureType.Normal })
  @Expose()
  ticketProcedureType: TicketProcedureType

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  ticketRegimenItemId: string

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  ticketRegimenId: string

  @Column({ default: 1 })
  @Expose()
  quantity: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number // Giá dự kiến

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number // tiền giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number // Giá thực tế

  @Column({ type: 'smallint', default: PaymentMoneyStatus.PendingPaid })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column({ type: 'smallint', default: TicketProcedureStatus.NoEffect })
  @Expose()
  status: TicketProcedureStatus

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  indexSession: number

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  createdAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  completedAt: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Column({ default: 0 })
  @Expose()
  costAmount: number // Tiền hoa hồng'

  @Column({ default: 0 })
  @Expose()
  commissionAmount: number // Tiền hoa hồng

  @Expose()
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureId', referencedColumnName: 'id' })
  procedure: Procedure

  @Expose()
  ticketUserRequestList: TicketUser[]

  @Expose()
  ticketUserResultList: TicketUser[]

  @Expose()
  imageIdList: number[]

  @Expose()
  imageList: Image[]

  static fromRaw(raw: { [P in keyof TicketProcedure]: any }) {
    if (!raw) return null
    const entity = new TicketProcedure()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = Number(raw.createdAt)
    entity.completedAt = raw.completedAt == null ? raw.completedAt : Number(raw.completedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketProcedure]: any }[]) {
    return raws.map((i) => TicketProcedure.fromRaw(i))
  }
}

export type TicketProcedureRelationType = {
  [P in keyof Pick<
    TicketProcedure,
    | 'ticket'
    | 'procedure'
    | 'customer'
    | 'imageIdList'
    | 'imageList'
    | 'ticketUserRequestList'
    | 'ticketUserResultList'
  >]?: boolean
}

export type TicketProcedureInsertType = Omit<TicketProcedure, keyof TicketProcedureRelationType>

export type TicketProcedureUpdateType = {
  [K in Exclude<
    keyof TicketProcedure,
    keyof TicketProcedureRelationType | keyof Pick<TicketProcedure, 'oid' | 'id'>
  >]?: TicketProcedure[K] | (() => string)
}

export type TicketProcedureSortType = {
  [P in keyof Pick<
    TicketProcedure,
    'id' | 'ticketId' | 'procedureId' | 'priority' | 'completedAt'
  >]?: 'ASC' | 'DESC'
}
