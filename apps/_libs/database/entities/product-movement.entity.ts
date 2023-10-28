import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { MovementType } from '../common/variable'
import Invoice from './invoice.entity'
import Product from './product.entity'
import Receipt from './receipt.entity'

@Index('IDX_ProductMovement__oid_productId_createdAt', ['oid', 'productId', 'createdAt'])
@Entity('ProductMovement')
export default class ProductMovement extends BaseEntity {
  @Column()
  @Expose()
  productId: number

  @Column() // ID invoice hoặc ID receipt
  @Expose()
  referenceId: number

  @Column({ type: 'smallint' })
  @Expose()
  type: MovementType

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  isRefund: 0 | 1

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openQuantity: number

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
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeQuantity: number

  @Column({ type: 'varchar', length: 255, default: '{"name":"","rate":1}' })
  @Expose()
  unit: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  price: number // Giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openCostAmount: number // Tổng tiền

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number // Tổng tiền

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeCostAmount: number // Tổng tiền

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'referenceId', referencedColumnName: 'id' })
  invoice: Invoice

  @Expose()
  @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'referenceId', referencedColumnName: 'id' })
  receipt: Receipt
}

export type ProductMovementInsertType = Omit<
  ProductMovement,
  'id' | 'product' | 'invoice' | 'receipt'
>
