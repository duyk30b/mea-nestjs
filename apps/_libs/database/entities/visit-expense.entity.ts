import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Visit from './visit.entity'

@Entity('VisitExpense')
@Index('IDX_VisitExpense__visitId', ['oid', 'visitId'])
export default class VisitExpense extends BaseEntity {
  @Column()
  @Expose()
  visitId: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  key: string

  @Column({ type: 'character varying', length: 255 })
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
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitId', referencedColumnName: 'id' })
  visit: Visit
}

export type VisitExpenseRelationType = Pick<VisitExpense, 'visit'>

export type VisitExpenseSortType = Pick<VisitExpense, 'oid' | 'id'>

export type VisitExpenseInsertType = Omit<
  VisitExpense,
  keyof VisitExpenseRelationType | keyof Pick<VisitExpense, 'id'>
>

export type VisitExpenseUpdateType = Omit<
  VisitExpense,
  keyof VisitExpenseRelationType | keyof Pick<VisitExpense, 'oid' | 'id'>
>
