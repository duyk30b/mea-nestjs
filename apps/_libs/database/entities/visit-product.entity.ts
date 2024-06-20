import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Product from './product.entity'
import Visit from './visit.entity'

@Entity('VisitProduct')
@Index('IDX_VisitProduct__oid_visitId', ['oid', 'visitId'])
export default class VisitProduct extends BaseEntity {
  @Column()
  @Expose()
  visitId: number

  @Column()
  @Expose()
  productId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  isSent: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

  @Column({ default: 0 })
  @Expose()
  quantityPrescription: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  quantity: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number // Tổng cost

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
    precision: 5,
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

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  hintUsage: string

  @Expose()
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitId', referencedColumnName: 'id' })
  visit: Visit

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  static fromRaw(raw: { [P in keyof VisitProduct]: any }) {
    if (!raw) return null
    const entity = new VisitProduct()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    return entity
  }

  static fromRaws(raws: { [P in keyof VisitProduct]: any }[]) {
    return raws.map((i) => VisitProduct.fromRaw(i))
  }
}

export type VisitProductInsertType = Omit<VisitProduct, 'id' | 'visit' | 'product'>

export type VisitProductUpdateType = Omit<VisitProduct, 'oid' | 'id' | 'visit' | 'product'>
