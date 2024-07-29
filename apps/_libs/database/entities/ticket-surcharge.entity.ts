import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Ticket from './ticket.entity'

@Entity('TicketSurcharge')
@Index('IDX_TicketSurcharge__ticketId', ['oid', 'ticketId'])
export default class TicketSurcharge extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  key: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  money: number

  @Expose()
  @ManyToOne((type) => Ticket, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket
}

export type TicketSurchargeRelationType = Pick<TicketSurcharge, 'ticket'>

export type TicketSurchargeSortType = Pick<TicketSurcharge, 'oid' | 'id'>

export type TicketSurchargeInsertType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'id'>
>

export type TicketSurchargeUpdateType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'oid' | 'id'>
>
