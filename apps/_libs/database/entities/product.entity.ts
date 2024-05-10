import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Batch from './batch.entity'

@Entity('Product')
@Index('IDX_Product__oid_brandName', ['oid', 'brandName'])
@Index('IDX_Product__oid_substance', ['oid', 'substance'])
@Index('IDX_Product__oid_group', ['oid', 'group'])
export default class Product extends BaseEntity {
  @Column({ type: 'character varying', length: 255 })
  @Expose()
  brandName: string // Tên biệt dược

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  substance: string // Hoạt chất

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  quantity: number

  @Column({ default: 1, type: 'smallint' })
  @Expose()
  hasManageQuantity: number

  @Column({ default: 0, type: 'smallint' })
  @Expose()
  hasManageBatches: number

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  group: string // Nhóm thuốc: kháng sinh, dinh dưỡng ...

  @Column({ type: 'text', default: '[]' })
  @Expose()
  unit: string

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  route: string // Đường dùng: uống, tiêm, ...

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  source: string // Nguồn gốc: ... Ấn Độ, Ý, Pháp, ...

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  image: string

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  hintUsage: string // Gợi ý cách sử dụng

  @Column({
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  costAmount: number // Tổng nhập

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

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

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
  @OneToMany(() => Batch, (batch) => batch.product)
  batches: Batch[]
}

export type ProductInsertType = Omit<
  Product,
  'id' | 'quantity' | 'costAmount' | 'batches' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type ProductUpdateType = Omit<
  Product,
  'oid' | 'id' | 'quantity' | 'costAmount' | 'batches' | 'createdAt' | 'updatedAt'
>
