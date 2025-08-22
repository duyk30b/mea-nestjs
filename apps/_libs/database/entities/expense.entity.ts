import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('Expense')
@Unique('UNIQUE_Expense__oid_code', ['oid', 'code'])
export default class Expense {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  code: string

  @Column()
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  static fromRaw(raw: { [P in keyof Expense]: any }) {
    if (!raw) return null
    const entity = new Expense()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Expense]: any }[]) {
    return raws.map((i) => Expense.fromRaw(i))
  }
}

export type ExpenseRelationType = {
  [P in keyof Pick<Expense, never>]?: boolean
}

export type ExpenseInsertType = Omit<Expense, keyof ExpenseRelationType | keyof Pick<Expense, 'id'>>

export type ExpenseUpdateType = {
  [K in Exclude<keyof Expense, keyof ExpenseRelationType | keyof Pick<Expense, 'oid' | 'id'>>]:
  | Expense[K]
  | (() => string)
}

export type ExpenseSortType = {
  [P in keyof Pick<Expense, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
