import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Product from './product.entity'

@Entity('Batch')
@Index('IDX_Batch__oid_productId', ['oid', 'productId'])
@Index('IDX_Batch__oid_updatedAt', ['oid', 'updatedAt'])
export default class Batch extends BaseEntity {
  @Column()
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  distributorId: number

  @Column({ default: 0 })
  @Expose()
  warehouseId: number

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  lotNumber: string // Số Lô sản phẩm

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  expiryDate: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  costPrice: number // Giá nhập

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
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  updatedAt: number

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  static fromRaw(raw: { [P in keyof Batch]: any }) {
    if (!raw) return null
    const entity = new Batch()
    Object.assign(entity, raw)

    entity.expiryDate = raw.expiryDate == null ? raw.expiryDate : Number(raw.expiryDate)
    entity.costPrice = Number(raw.costPrice)
    entity.quantity = Number(raw.quantity)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Batch]: any }[]) {
    return raws.map((i) => Batch.fromRaw(i))
  }
}

export type BatchRelationType = {
  [P in keyof Pick<Batch, 'product'>]?: boolean
}

export type BatchInsertType = Omit<
  Batch,
  keyof BatchRelationType | keyof Pick<Batch, 'id' | 'quantity' | 'updatedAt'>
>

export type BatchUpdateType = {
  [K in Exclude<
    keyof Batch,
    | keyof BatchRelationType
    | keyof Pick<Batch, 'oid' | 'id' | 'productId' | 'distributorId' | 'updatedAt'>
  >]: Batch[K] | (() => string)
}

export type BatchSortType = {
  [P in keyof Pick<Batch, 'id' | 'quantity' | 'expiryDate'>]?: 'ASC' | 'DESC'
}
