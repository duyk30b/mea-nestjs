import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Ticket from './ticket.entity'

@Entity('TicketExpense')
@Index('IDX_TicketExpense__ticketId', ['oid', 'ticketId'])
export default class TicketExpense extends BaseEntity {
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

export type TicketExpenseRelationType = Pick<TicketExpense, 'ticket'>

export type TicketExpenseSortType = Pick<TicketExpense, 'oid' | 'id'>

export type TicketExpenseInsertType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'id'>
>

export type TicketExpenseUpdateType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'oid' | 'id'>
>
