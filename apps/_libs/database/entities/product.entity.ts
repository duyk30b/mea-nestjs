import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { InventoryStrategy } from '../common/variable'
import Batch from './batch.entity'
import Commission from './commission.entity'
import ProductGroup from './product-group.entity'

@Entity('Product')
@Index('IDX_Product__oid_brandName', ['oid', 'brandName'])
@Index('IDX_Product__oid_substance', ['oid', 'substance'])
@Unique('UNIQUE_Product__oid_productCode', ['oid', 'productCode'])
export default class Product {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  productCode: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  brandName: string // Tên biệt dược

  @Column({ type: 'varchar', length: 255, nullable: true })
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

  @Column({ default: InventoryStrategy.UseSystemDefault, type: 'smallint' })
  @Expose()
  inventoryStrategy: InventoryStrategy

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

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([0]) })
  @Expose()
  warehouseIds: string

  @Expose()
  warehouseIdList: number[]

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

  @ManyToOne((type) => ProductGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productGroupId', referencedColumnName: 'id' })
  @Expose()
  productGroup: ProductGroup

  @Expose()
  @OneToMany(() => Batch, (batch) => batch.product)
  batchList: Batch[]

  @Expose()
  commissionList: Commission[]

  static fromRaw(raw: { [P in keyof Product]: any }) {
    if (!raw) return null
    const entity = new Product()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)
    entity.costPrice = Number(raw.costPrice)
    entity.wholesalePrice = Number(raw.wholesalePrice)
    entity.retailPrice = Number(raw.retailPrice)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Product]: any }[]) {
    return raws.map((i) => Product.fromRaw(i))
  }
}

export type ProductRelationType = {
  [P in keyof Pick<Product, 'batchList' | 'productGroup' | 'commissionList'>]?: boolean
}

export type ProductInsertType = Omit<
  Product,
  keyof ProductRelationType | keyof Pick<Product, 'id' | 'updatedAt' | 'warehouseIdList'>
>

export type ProductUpdateType = {
  [K in Exclude<
    keyof Product,
    | keyof ProductRelationType
    | keyof Pick<Product, 'oid' | 'id' | 'quantity' | 'updatedAt' | 'warehouseIdList'>
  >]: Product[K] | (() => string)
}

export type ProductSortType = {
  [P in keyof Pick<Product, 'id' | 'productCode' | 'quantity' | 'brandName'>]?: 'ASC' | 'DESC'
}
