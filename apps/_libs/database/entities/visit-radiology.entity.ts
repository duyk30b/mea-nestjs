import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Image from './image.entity'
import Radiology from './radiology.entity'
import User from './user.entity'
import Visit from './visit.entity'

@Entity('VisitRadiology')
@Index('IDX_VisitRadiology__oid_visitId', ['oid', 'visitId'])
@Index('IDX_VisitRadiology__oid_radiologyId', ['oid', 'radiologyId'])
export default class VisitRadiology extends BaseEntity {
  @Column()
  @Expose()
  visitId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  radiologyId: number

  @Column({ default: 0 })
  @Expose()
  doctorId: number

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
  startedAt: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  description: string // Mô tả

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Expose()
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitId', referencedColumnName: 'id' })
  visit: Visit

  @Expose()
  @ManyToOne((type) => Radiology, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'radiologyId', referencedColumnName: 'id' })
  radiology: Radiology

  @Expose()
  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'doctorId', referencedColumnName: 'id' })
  doctor: User

  @Expose()
  imageList: Image[]

  static fromRaw(raw: { [P in keyof VisitRadiology]: any }) {
    if (!raw) return null
    const entity = new VisitRadiology()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof VisitRadiology]: any }[]) {
    return raws.map((i) => VisitRadiology.fromRaw(i))
  }
}

export type VisitRadiologyRelationType = Pick<
  VisitRadiology,
  'visit' | 'radiology' | 'doctor' | 'imageList'
>

export type VisitRadiologySortType = Pick<VisitRadiology, 'id' | 'visitId' | 'radiologyId'>

export type VisitRadiologyInsertType = Omit<
  VisitRadiology,
  keyof VisitRadiologyRelationType | keyof Pick<VisitRadiology, 'id'>
>

export type VisitRadiologyInsertBasicType = Omit<
  VisitRadiology,
  | keyof VisitRadiologyRelationType
  | keyof Pick<
      VisitRadiology,
      'id' | 'doctorId' | 'startedAt' | 'description' | 'result' | 'imageIds'
    >
>

export type VisitRadiologyUpdateType = Omit<
  VisitRadiology,
  keyof VisitRadiologyRelationType | keyof Pick<VisitRadiology, 'oid' | 'id'>
>
