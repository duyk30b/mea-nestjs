import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Customer from './customer.entity'
import Procedure from './procedure.entity'
import Ticket from './ticket.entity'

@Entity('TicketProcedure')
@Index('IDX_TicketProcedure__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketProcedure__oid_procedureId', ['oid', 'procedureId'])
export default class TicketProcedure extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

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
  createdAt: number

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Ticket, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureId', referencedColumnName: 'id' })
  procedure: Procedure

  static fromRaw(raw: { [P in keyof TicketProcedure]: any }) {
    if (!raw) return null
    const entity = new TicketProcedure()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketProcedure]: any }[]) {
    return raws.map((i) => TicketProcedure.fromRaw(i))
  }
}

export type TicketProcedureRelationType = Pick<TicketProcedure, 'ticket' | 'procedure' | 'customer'>

export type TicketProcedureSortType = Pick<TicketProcedure, 'id' | 'ticketId' | 'procedureId'>

export type TicketProcedureInsertType = Omit<
  TicketProcedure,
  keyof TicketProcedureRelationType | keyof Pick<TicketProcedure, 'id'>
>

export type TicketProcedureUpdateType = Omit<
  TicketProcedure,
  keyof TicketProcedureRelationType | keyof Pick<TicketProcedure, 'oid' | 'id'>
>