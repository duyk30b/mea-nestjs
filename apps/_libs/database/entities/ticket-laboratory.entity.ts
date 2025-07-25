import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, PaymentMoneyStatus, TicketLaboratoryStatus } from '../common/variable'
import Customer from './customer.entity'
import Laboratory from './laboratory.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

@Entity('TicketLaboratory')
@Index('IDX_TicketLaboratory__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketLaboratory__oid_laboratoryId', ['oid', 'laboratoryId'])
@Index('IDX_TicketLaboratory__oid_startedAt', ['oid', 'startedAt'])
export default class TicketLaboratory extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Expose()
  @Column({ default: 0 })
  roomId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  laboratoryId: number

  @Column({ default: 0 })
  @Expose()
  laboratoryGroupId: number

  @Column({ default: 0 })
  @Expose()
  ticketLaboratoryGroupId: number

  @Column({ type: 'smallint', default: TicketLaboratoryStatus.Pending })
  @Expose()
  status: TicketLaboratoryStatus

  @Column({ type: 'smallint', default: PaymentMoneyStatus.NoEffect })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costPrice: number

  @Column({
    type: 'bigint',
    default: 0,
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
    default: 0,
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

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketLaboratoryList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Laboratory, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'laboratoryId', referencedColumnName: 'id' })
  laboratory: Laboratory

  @Expose()
  @OneToMany(() => Laboratory, (laboratory) => laboratory.ticketLaboratory)
  laboratoryList: Laboratory[]

  @Expose()
  ticketUserList: TicketUser[]

  static fromRaw(raw: { [P in keyof TicketLaboratory]: any }) {
    if (!raw) return null
    const entity = new TicketLaboratory()
    Object.assign(entity, raw)

    entity.costPrice = Number(raw.costPrice)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketLaboratory]: any }[]) {
    return raws.map((i) => TicketLaboratory.fromRaw(i))
  }
}

export type TicketLaboratoryRelationType = {
  [P in keyof Pick<
    TicketLaboratory,
    'ticket' | 'customer' | 'laboratory' | 'ticketUserList' | 'laboratoryList'
  >]?: boolean
}

export type TicketLaboratoryInsertType = Omit<
  TicketLaboratory,
  keyof TicketLaboratoryRelationType | keyof Pick<TicketLaboratory, 'id'>
>

export type TicketLaboratoryUpdateType = {
  [K in Exclude<
    keyof TicketLaboratory,
    keyof TicketLaboratoryRelationType | keyof Pick<TicketLaboratory, 'oid' | 'id'>
  >]: TicketLaboratory[K] | (() => string)
}

export type TicketLaboratorySortType = {
  [P in keyof Pick<
    TicketLaboratory,
    'id' | 'ticketId' | 'laboratoryId' | 'startedAt' | 'priority'
  >]?: 'ASC' | 'DESC'
}
