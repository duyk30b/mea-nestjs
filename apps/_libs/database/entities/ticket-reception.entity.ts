import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import CustomerSource from './customer-source.entity'
import Customer from './customer.entity'
import Room from './room.entity'
import Ticket from './ticket.entity'

@Entity('TicketReception')
@Index('IDX_TicketReception__oid_receptionAt', ['oid', 'receptionAt'])
export default class TicketReception {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ default: 0 })
  @Expose()
  roomId: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  customerSourceId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isFirstReception: number

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  receptionAt: number

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  reason: string // Tên dịch vụ

  @Expose()
  customer: Customer

  @Expose()
  room: Room

  @Expose()
  customerSource: CustomerSource

  @Expose()
  ticket: Ticket

  @Expose()
  static fromRaw(raw: { [P in keyof TicketReception]: any }) {
    if (!raw) return null
    const entity = new TicketReception()
    Object.assign(entity, raw)
    entity.receptionAt = Number(raw.receptionAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketReception]: any }[]) {
    return raws.map((i) => TicketReception.fromRaw(i))
  }
}

export type TicketReceptionRelationType = {
  [P in keyof Pick<TicketReception, 'customer' | 'ticket' | 'room' | 'customerSource'>]?: boolean
}

export type TicketReceptionInsertType = Omit<
  TicketReception,
  keyof TicketReceptionRelationType | keyof Pick<TicketReception, 'id'>
>

export type TicketReceptionUpdateType = {
  [K in Exclude<
    keyof TicketReception,
    keyof TicketReceptionRelationType | keyof Pick<TicketReception, 'oid' | 'id'>
  >]?: TicketReception[K] | (() => string)
}

export type TicketReceptionSortType = {
  [P in keyof Pick<TicketReception, 'id' | 'receptionAt' | 'customerId'>]?: 'ASC' | 'DESC'
}
