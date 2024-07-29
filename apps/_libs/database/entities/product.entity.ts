import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Batch from './batch.entity'
import ProductGroup from './product-group.entity'

@Entity('Product')
@Index('IDX_Product__oid_brandName', ['oid', 'brandName'])
@Index('IDX_Product__oid_substance', ['oid', 'substance'])
export default class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Expose()
  brandName: string // Tên biệt dược

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  substance: string // Hoạt chất

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

  @Column({ default: 1, type: 'smallint' })
  @Expose()
  hasManageQuantity: 0 | 1

  @Column({ default: 0, type: 'smallint' })
  @Expose()
  hasManageBatches: 0 | 1

  @Expose()
  @Column({ default: 0 })
  productGroupId: number

  @Column({ type: 'text', default: JSON.stringify([]) })
  @Expose()
  unit: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  route: string // Đường dùng: uống, tiêm, ...

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  source: string // Nguồn gốc: ... Ấn Độ, Ý, Pháp, ...

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  image: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  hintUsage: string // Gợi ý cách sử dụng

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

  @ManyToOne((type) => ProductGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productGroupId', referencedColumnName: 'id' })
  @Expose()
  productGroup: ProductGroup

  @Expose()
  @OneToMany(() => Batch, (batch) => batch.product)
  batchList: Batch[]

  static fromRaw(raw: { [P in keyof Product]: any }) {
    if (!raw) return null
    const entity = new Product()
    Object.assign(entity, raw)

    entity.expiryDate = raw.expiryDate == null ? raw.expiryDate : Number(raw.expiryDate)
    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.costPrice = Number(raw.costPrice)
    entity.wholesalePrice = Number(raw.wholesalePrice)
    entity.retailPrice = Number(raw.retailPrice)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Product]: any }[]) {
    return raws.map((i) => Product.fromRaw(i))
  }
}

export type ProductRelationType = Pick<Product, 'batchList' | 'productGroup'>

export type ProductSortType = Pick<
  Product,
  'id' | 'quantity' | 'brandName' | 'costAmount' | 'expiryDate'
>

export type ProductInsertType = Omit<
  Product,
  | keyof ProductRelationType
  | keyof Pick<Product, 'id' | 'quantity' | 'costAmount' | 'updatedAt' | 'deletedAt'>
>

export type ProductUpdateType = Omit<
  Product,
  | keyof ProductRelationType
  | keyof Pick<Product, 'oid' | 'id' | 'quantity' | 'costAmount' | 'updatedAt'>
>
