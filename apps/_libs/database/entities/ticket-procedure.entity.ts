import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Customer from './customer.entity'
import Image from './image.entity'
import Procedure from './procedure.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

export enum TicketProcedureStatus {
  Empty = 1,
  Pending = 2,
  Completed = 3,
}

@Entity('TicketProcedure')
@Index('IDX_TicketProcedure__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketProcedure__oid_procedureId', ['oid', 'procedureId'])
export default class TicketProcedure extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

  @Column({ type: 'smallint', default: TicketProcedureStatus.Pending })
  @Expose()
  status: TicketProcedureStatus

  @Column({ default: 0 })
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

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  startedAt: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

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
  imageList: Image[]

  @Expose()
  ticketUserList: TicketUser[]

  static fromRaw(raw: { [P in keyof TicketProcedure]: any }) {
    if (!raw) return null
    const entity = new TicketProcedure()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketProcedure]: any }[]) {
    return raws.map((i) => TicketProcedure.fromRaw(i))
  }
}

export type TicketProcedureRelationType = {
  [P in keyof Pick<
    TicketProcedure,
    'ticket' | 'procedure' | 'customer' | 'imageList' | 'ticketUserList'
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
