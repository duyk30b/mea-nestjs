import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DeliveryStatus, DiscountType } from '../common/variable'
import Batch from './batch.entity'
import Customer from './customer.entity'
import Product from './product.entity'
import Ticket from './ticket.entity'

export enum TicketProductType {
  Prescription = 1,
  Consumable = 2,
}

@Entity('TicketProduct')
@Index('IDX_TicketProduct__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketProduct__oid_customerId', ['oid', 'customerId'])
export default class TicketProduct extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  batchId: number

  @Column({ type: 'smallint', default: DeliveryStatus.Pending })
  @Expose()
  deliveryStatus: DeliveryStatus

  @Column({ type: 'smallint', default: TicketProductType.Prescription })
  @Expose()
  type: TicketProductType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

  @Column({ default: 0 })
  @Expose()
  quantityPrescription: number

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
  quantityReturn: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number // Tổng cost

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number // Giá dự kiến

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number // tiền giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number // Giá thực tế

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  hintUsage: string

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

  static fromRaw(raw: { [P in keyof TicketProduct]: any }) {
    if (!raw) return null
    const entity = new TicketProduct()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketProduct]: any }[]) {
    return raws.map((i) => TicketProduct.fromRaw(i))
  }
}

export type TicketProductRelationType = Pick<
  TicketProduct,
  'ticket' | 'customer' | 'product' | 'batch'
>

export type TicketProductSortType = Pick<TicketProduct, 'oid' | 'id' | 'ticketId' | 'productId'>

export type TicketProductInsertType = Omit<
  TicketProduct,
  keyof TicketProductRelationType | keyof Pick<TicketProduct, 'id'>
>

export type TicketProductUpdateType = Omit<
  TicketProduct,
  keyof TicketProductRelationType | keyof Pick<TicketProduct, 'oid' | 'id'>
>
