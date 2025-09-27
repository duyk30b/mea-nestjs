import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { MovementType } from '../common/variable'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import Product from './product.entity'
import PurchaseOrder from './purchase-order.entity'
import StockCheck from './stock-check.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

@Entity('ProductMovement')
@Index('IDX_ProductMovement__oid_productId_id', ['oid', 'productId', 'id'])
@Index('IDX_ProductMovement__oid_contactId_movementType_id', [
  'oid',
  'contactId',
  'movementType',
  'id',
])
export default class ProductMovement {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'smallint' })
  @Expose()
  movementType: MovementType

  @Column({ default: 0 }) // ID customer hoặc ID distributor hoặc userId
  @Expose()
  contactId: number

  @Column({ type: 'bigint' }) // ticketId hoặc purchaseOrder hoặc stockCheckId
  @Expose()
  voucherId: string

  @Column({ type: 'bigint', default: 0 }) // ticketProductId hoặc purchaseOrderItemId hoặc stockCheckItemId
  @Expose()
  voucherProductId: string

  @Column({ default: 0 })
  @Expose()
  warehouseId: number

  @Column()
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  batchId: number

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
  quantity: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openQuantityProduct: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeQuantityProduct: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openQuantityBatch: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeQuantityBatch: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  openCostAmountBatch: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  closeCostAmountBatch: number

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
  actualPrice: number // Giá

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  product: Product

  @Expose()
  distributor: Distributor

  @Expose()
  purchaseOrder: PurchaseOrder

  @Expose()
  customer: Customer

  @Expose()
  ticket: Ticket

  @Expose()
  stockCheck: StockCheck

  @Expose()
  user: User

  static fromRaw(raw: { [P in keyof ProductMovement]: any }) {
    if (!raw) return null
    const entity = new ProductMovement()
    Object.assign(entity, raw)
    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.openQuantityProduct = Number(raw.openQuantityProduct)
    entity.closeQuantityProduct = Number(raw.closeQuantityProduct)
    entity.openQuantityBatch = Number(raw.openQuantityBatch)
    entity.closeQuantityBatch = Number(raw.closeQuantityBatch)
    entity.openCostAmountBatch = Number(raw.openCostAmountBatch)
    entity.closeCostAmountBatch = Number(raw.closeCostAmountBatch)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.actualPrice = Number(raw.actualPrice)
    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof ProductMovement]: any }[]) {
    return raws.map((i) => ProductMovement.fromRaw(i))
  }
}

export type ProductMovementRelationType = {
  [P in keyof Pick<
    ProductMovement,
    'product' | 'purchaseOrder' | 'ticket' | 'stockCheck' | 'distributor' | 'customer' | 'user'
  >]?: boolean
}

export type ProductMovementInsertType = Omit<
  ProductMovement,
  keyof ProductMovementRelationType | keyof Pick<ProductMovement, 'id'>
>

export type ProductMovementUpdateType = {
  [K in Exclude<
    keyof ProductMovement,
    keyof ProductMovementRelationType | keyof Pick<ProductMovement, 'oid' | 'id'>
  >]: ProductMovement[K] | (() => string)
}

export type ProductMovementSortType = {
  [P in keyof Pick<ProductMovement, 'id'>]?: 'ASC' | 'DESC'
}
