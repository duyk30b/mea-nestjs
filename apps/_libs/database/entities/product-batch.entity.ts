import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Product from './product.entity'

@Entity('ProductBatch')
@Index('IDX_ProductBatch__oid_productId', ['oid', 'productId'])
@Index('IDX_ProductBatch__oid_updatedAt', ['oid', 'updatedAt'])
@Index('IDX_ProductBatch__quantity', ['quantity'])
export default class ProductBatch extends BaseEntity {
  @Column()
  @Expose()
  productId: number

  @Column({ type: 'character varying', length: 255, default: '' })
  @Expose()
  batch: string // Lô sản phẩm

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
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  wholesalePrice: number // Giá bán sỉ

  @Column({
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  retailPrice: number // Giá bán lẻ

  @Column({ default: 0 })
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
  createdAt: number

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

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  deletedAt: number

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product
}

export type ProductBatchInsertType = Omit<
  ProductBatch,
  'id' | 'quantity' | 'product' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
export type ProductBatchUpdateType = Omit<
  ProductBatch,
  'oid' | 'id' | 'quantity' | 'product' | 'createdAt' | 'updatedAt'
>
