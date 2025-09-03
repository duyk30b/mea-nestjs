import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, PaymentMoneyStatus, TicketProcedureStatus } from '../common/variable'
import Customer from './customer.entity'
import Procedure, { ProcedureType } from './procedure.entity'
import TicketProcedureItem from './ticket-procedure-item.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

@Entity('TicketProcedure')
@Index('IDX_TicketProcedure__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketProcedure__oid_procedureId', ['oid', 'procedureId'])
@Index('IDX_TicketProcedure__oid_createdAt', ['oid', 'createdAt'])
export default class TicketProcedure extends BaseEntity {
  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

  @Column({ type: 'smallint', default: ProcedureType.Basic })
  @Expose()
  type: ProcedureType

  @Column({ default: 1 })
  @Expose()
  quantity: number

  @Column({ default: 0 })
  @Expose()
  totalSessions: number

  @Column({ default: 0 })
  @Expose()
  finishedSessions: number

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

  @Column({ type: 'smallint', default: PaymentMoneyStatus.NoEffect })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column({ type: 'smallint', default: TicketProcedureStatus.Pending })
  @Expose()
  status: TicketProcedureStatus

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  createdAt: number

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketProcedureList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
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
  ticketProcedureItemList: TicketProcedureItem[]

  @Expose()
  ticketUserRequestList: TicketUser[]

  static fromRaw(raw: { [P in keyof TicketProcedure]: any }) {
    if (!raw) return null
    const entity = new TicketProcedure()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = Number(raw.createdAt)
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
    | 'ticketProcedureItemList'
    | 'ticketUserRequestList'
  >]?: boolean
}

export type TicketProcedureInsertType = Omit<
  TicketProcedure,
  keyof TicketProcedureRelationType | keyof Pick<TicketProcedure, 'id'>
>

export type TicketProcedureUpdateType = {
  [K in Exclude<
    keyof TicketProcedure,
    keyof TicketProcedureRelationType | keyof Pick<TicketProcedure, 'oid' | 'id'>
  >]?: TicketProcedure[K] | (() => string)
}

export type TicketProcedureSortType = {
  [P in keyof Pick<TicketProcedure, 'id' | 'ticketId' | 'procedureId' | 'priority'>]?:
  | 'ASC'
  | 'DESC'
}
