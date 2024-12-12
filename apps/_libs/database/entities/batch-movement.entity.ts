import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { MovementType } from '../common/variable'
import Batch from './batch.entity'
import Customer from './customer.entity'
import Distributor from './distributor.entity'
import Product from './product.entity'
import Receipt from './receipt.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

@Index('IDX_BatchMovement__oid_productId_batchId_createdAt', [
  'oid',
  'productId',
  'batchId',
  'createdAt',
])
@Entity('BatchMovement')
export default class BatchMovement extends BaseEntity {
  @Column({ default: 0 })
  @Expose()
  warehouseId: number

  @Column()
  @Expose()
  productId: number

  @Column()
  @Expose()
  batchId: number

  @Column() // ID ticket hoặc ID receipt
  @Expose()
  voucherId: number

  @Column({ type: 'smallint' })
  @Expose()
  movementType: MovementType

  @Column({ default: 0 }) // ID customer hoặc ID distributor
  @Expose()
  contactId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  isRefund: 0 | 1

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

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
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

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

  @Expose()
  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'contactId', referencedColumnName: 'id' })
  user: User

  static fromRaw(raw: { [P in keyof BatchMovement]: any }) {
    if (!raw) return null
    const entity = new BatchMovement()
    Object.assign(entity, raw)
    entity.openQuantity = Number(raw.openQuantity)
    entity.quantity = Number(raw.quantity)
    entity.closeQuantity = Number(raw.closeQuantity)
    entity.actualPrice = Number(raw.actualPrice)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof BatchMovement]: any }[]) {
    return raws.map((i) => BatchMovement.fromRaw(i))
  }
}

export type BatchMovementRelationType = {
  [P in keyof Pick<
    BatchMovement,
    'batch' | 'product' | 'distributor' | 'customer' | 'receipt' | 'ticket' | 'user'
  >]?: boolean
}

export type BatchMovementInsertType = Omit<
  BatchMovement,
  keyof BatchMovementRelationType | keyof Pick<BatchMovement, 'id'>
>

export type BatchMovementUpdateType = {
  [K in Exclude<
    keyof BatchMovement,
    keyof BatchMovementRelationType | keyof Pick<BatchMovement, 'oid' | 'id'>
  >]: BatchMovement[K] | (() => string)
}

export type BatchMovementSortType = {
  [P in keyof Pick<BatchMovement, 'id'>]?: 'ASC' | 'DESC'
}
