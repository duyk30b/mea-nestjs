import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Visit from './visit.entity'

@Entity('VisitSurcharge')
@Index('IDX_VisitSurcharge__visitId', ['oid', 'visitId'])
export default class VisitSurcharge extends BaseEntity {
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

export type VisitSurchargeRelationType = Pick<VisitSurcharge, 'visit'>

export type VisitSurchargeSortType = Pick<VisitSurcharge, 'oid' | 'id'>

export type VisitSurchargeInsertType = Omit<
  VisitSurcharge,
  keyof VisitSurchargeRelationType | keyof Pick<VisitSurcharge, 'id'>
>

export type VisitSurchargeUpdateType = Omit<
  VisitSurcharge,
  keyof VisitSurchargeRelationType | keyof Pick<VisitSurcharge, 'oid' | 'id'>
>
