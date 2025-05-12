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
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketExpenseList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  static fromRaw(raw: { [P in keyof TicketExpense]: any }) {
    if (!raw) return null
    const entity = new TicketExpense()
    Object.assign(entity, raw)

    entity.money = Number(raw.money)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketExpense]: any }[]) {
    return raws.map((i) => TicketExpense.fromRaw(i))
  }
}

export type TicketExpenseRelationType = {
  [P in keyof Pick<TicketExpense, 'ticket'>]?: boolean
}

export type TicketExpenseInsertType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'id'>
>

export type TicketExpenseUpdateType = {
  [K in Exclude<
    keyof TicketExpense,
    keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'oid' | 'id'>
  >]: TicketExpense[K] | (() => string)
}

export type TicketExpenseSortType = {
  [P in keyof Pick<TicketExpense, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
