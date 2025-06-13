import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { DiscountType } from '../common/variable'
import Laboratory from './laboratory.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'
import Radiology from './radiology.entity'

export enum DiscountInteractType {
  Product = 1,
  Procedure = 2,
  Laboratory = 3,
  Radiology = 4,
}

export enum DiscountRepeatType {
  Once = 1, // không repeat
  Weekly = 2, // Hàng ngày, từ thứ 2 đến chủ nhật
}

@Entity('Discount')
@Index('IDX_Discount__oid_discountInteractType_discountInteractId', [
  'oid',
  'discountInteractType',
  'discountInteractId',
])
export default class Discount {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @Column({ type: 'integer', default: 0 })
  @Expose()
  priority: number

  @Column({ type: 'smallint', default: DiscountInteractType.Product })
  @Expose()
  discountInteractType: DiscountInteractType

  @Column({ type: 'integer', default: 0 })
  @Expose()
  discountInteractId: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number

  @Column({ type: 'varchar', length: 25, default: DiscountType.Percent })
  @Expose()
  discountType: DiscountType

  @Column({ type: 'smallint', default: DiscountRepeatType.Weekly })
  @Expose()
  discountRepeatType: DiscountRepeatType

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  periodsDay: string // [2,3,4,5,6,7]

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  periodsTime: string // [[11:30,13:30],[15h:17h],[21h:23h]]

  @Expose()
  product: Product

  @Expose()
  procedure: Procedure

  @Expose()
  radiology: Radiology

  @Expose()
  laboratory: Laboratory

  static fromRaw(raw: { [P in keyof Discount]: any }) {
    if (!raw) return null
    const entity = new Discount()
    Object.assign(entity, raw)

    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    return entity
  }

  static fromRaws(raws: { [P in keyof Discount]: any }[]) {
    return raws.map((i) => Discount.fromRaw(i))
  }
}

export type DiscountRelationType = {
  [P in keyof Pick<Discount, 'product' | 'procedure' | 'radiology' | 'laboratory'>]?: boolean
}

export type DiscountInsertType = Omit<
  Discount,
  keyof DiscountRelationType | keyof Pick<Discount, 'id'>
>

export type DiscountUpdateType = {
  [K in Exclude<keyof Discount, keyof DiscountRelationType | keyof Pick<Discount, 'oid' | 'id'>>]:
  | Discount[K]
  | (() => string)
}

export type DiscountSortType = {
  [P in keyof Pick<Discount, 'oid' | 'id' | 'discountType'>]?: 'ASC' | 'DESC'
}
