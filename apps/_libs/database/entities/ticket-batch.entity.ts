import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { DeliveryStatus } from '../common/variable'
import Batch from './batch.entity'
import Customer from './customer.entity'
import Product from './product.entity'
import Ticket from './ticket.entity'

@Entity('TicketBatch')
@Index('IDX_TicketBatch__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketBatch__oid_productId', ['oid', 'productId'])
@Index('IDX_TicketBatch__oid_customerId', ['oid', 'customerId'])
export default class TicketBatch {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column()
  @Expose()
  customerId: number

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketProductId: string

  @Column()
  @Expose()
  warehouseId: number

  @Column()
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  batchId: number

  @Column({ type: 'smallint', default: DeliveryStatus.Pending })
  @Expose()
  deliveryStatus: DeliveryStatus

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
  quantity: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketProductList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  static fromRaw(raw: { [P in keyof TicketBatch]: any }) {
    if (!raw) return null
    const entity = new TicketBatch()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.actualPrice = Number(raw.actualPrice)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketBatch]: any }[]) {
    return raws.map((i) => TicketBatch.fromRaw(i))
  }
}

export type TicketBatchRelationType = {
  [P in keyof Pick<TicketBatch, 'ticket' | 'customer' | 'product' | 'batch'>]?: boolean
}

export type TicketBatchInsertType = Omit<TicketBatch, keyof TicketBatchRelationType>

export type TicketBatchUpdateType = {
  [K in Exclude<
    keyof TicketBatch,
    keyof TicketBatchRelationType | keyof Pick<TicketBatch, 'oid' | 'id'>
  >]: TicketBatch[K] | (() => string)
}

export type TicketBatchSortType = {
  [P in keyof Pick<TicketBatch, 'oid' | 'id' | 'ticketId' | 'productId' | 'ticketProductId'>]?:
  | 'ASC'
  | 'DESC'
}
