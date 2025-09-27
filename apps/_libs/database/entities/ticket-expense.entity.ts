import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import Expense from './expense.entity'

@Entity('TicketExpense')
@Index('IDX_TicketExpense__ticketId', ['oid', 'ticketId'])
export default class TicketExpense {
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
  expenseId: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  money: number

  @Expose()
  expense: Expense

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
  [P in keyof Pick<TicketExpense, 'expense'>]?: boolean
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
