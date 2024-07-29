import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { VoucherType } from '../common/variable'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import Product from './product.entity'
import Receipt from './receipt.entity'
import Ticket from './ticket.entity'

@Entity('ProductMovement')
@Index('IDX_ProductMovement__oid_productId_id', ['oid', 'productId', 'id'])
@Index('IDX_ProductMovement__oid_contactId_voucherType_id', [
  'oid',
  'contactId',
  'voucherType',
  'id',
])
export default class ProductMovement extends BaseEntity {
  @Column()
  @Expose()
  productId: number

  @Column() // ID ticket hoặc ID receipt
  @Expose()
  voucherId: number

  @Column({ default: 0 }) // ID customer hoặc ID distributor
  @Expose()
  contactId: number

  @Column({ type: 'smallint' })
  @Expose()
  voucherType: VoucherType

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

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number // Giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number // Giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openCostAmount: number // Tổng vốn

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
  closeCostAmount: number // Tổng vốn

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
  @ManyToOne((type) => Ticket, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'contactId', referencedColumnName: 'id' })
  distributor: Distributor

  @Expose()
  @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'voucherId', referencedColumnName: 'id' })
  receipt: Receipt

  @Expose()
  @ManyToOne((type) => Ticket, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'contactId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Ticket, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'voucherId', referencedColumnName: 'id' })
  ticket: Ticket
}

export type ProductMovementRelationType = Pick<
  ProductMovement,
  'product' | 'distributor' | 'receipt' | 'customer' | 'ticket'
>

export type ProductMovementSortType = Pick<
  ProductMovement,
  'id' | 'productId' | 'voucherId' | 'contactId'
>

export type ProductMovementInsertType = Omit<
  ProductMovement,
  keyof ProductMovementRelationType | keyof Pick<ProductMovement, 'id'>
>
