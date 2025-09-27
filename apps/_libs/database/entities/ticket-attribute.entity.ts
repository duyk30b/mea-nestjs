import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Ticket from './ticket.entity'

@Entity('TicketAttribute')
@Index('IDX_TicketAttribute__oid_ticketId', ['oid', 'ticketId'])
export default class TicketAttribute {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ nullable: false, type: 'varchar', length: 100 })
  @Expose({})
  key: string

  @Column({ type: 'text', default: '' })
  @Expose({})
  value: string

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketAttributeList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  static fromRaw(raw: { [P in keyof TicketAttribute]: any }) {
    if (!raw) return null
    const entity = new TicketAttribute()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketAttribute]: any }[]) {
    return raws.map((i) => TicketAttribute.fromRaw(i))
  }
}

export type TicketAttributeRelationType = {
  [P in keyof Pick<TicketAttribute, 'ticket'>]?: boolean
}

export type TicketAttributeInsertType = Omit<
  TicketAttribute,
  keyof TicketAttributeRelationType | keyof Pick<TicketAttribute, 'id'>
>

export type TicketAttributeUpdateType = {
  [K in Exclude<
    keyof TicketAttribute,
    keyof TicketAttributeRelationType | keyof Pick<TicketAttribute, 'oid' | 'id'>
  >]: TicketAttribute[K] | (() => string)
}

export type TicketAttributeSortType = {
  [P in keyof Pick<TicketAttribute, 'oid' | 'id' | 'ticketId'>]?: 'ASC' | 'DESC'
}
