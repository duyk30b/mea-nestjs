import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Procedure from './procedure.entity'
import Visit from './visit.entity'

@Entity('VisitProcedure')
@Index('IDX_VisitProcedure__oid_visitId', ['oid', 'visitId'])
@Index('IDX_VisitProcedure__oid_procedureId', ['oid', 'procedureId'])
export default class VisitProcedure extends BaseEntity {
  @Column()
  @Expose()
  visitId: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

  @Column({ default: 0 })
  @Expose()
  quantity: number

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
  createdAt: number

  @Expose()
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitId', referencedColumnName: 'id' })
  visit: Visit

  @Expose()
  @ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureId', referencedColumnName: 'id' })
  procedure: Procedure

  static fromRaw(raw: { [P in keyof VisitProcedure]: any }) {
    if (!raw) return null
    const entity = new VisitProcedure()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof VisitProcedure]: any }[]) {
    return raws.map((i) => VisitProcedure.fromRaw(i))
  }
}

export type VisitProcedureRelationType = Pick<VisitProcedure, 'visit' | 'procedure'>

export type VisitProcedureSortType = Pick<VisitProcedure, 'id' | 'visitId' | 'procedureId'>

export type VisitProcedureInsertType = Omit<
  VisitProcedure,
  keyof VisitProcedureRelationType | keyof Pick<VisitProcedure, 'id'>
>

export type VisitProcedureUpdateType = Omit<
  VisitProcedure,
  keyof VisitProcedureRelationType | keyof Pick<VisitProcedure, 'oid' | 'id'>
>
