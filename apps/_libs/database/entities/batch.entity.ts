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

  @Column({ type: 'character varying', length: 255, default: '' })
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
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  costAmount: number // Tổng tiền nhập

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

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product
}

export type BatchInsertType = Omit<
  Batch,
  'id' | 'quantity' | 'product' | 'costAmount' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
export type BatchUpdateType = Omit<
  Batch,
  'oid' | 'id' | 'quantity' | 'product' | 'createdAt' | 'updatedAt'
>
