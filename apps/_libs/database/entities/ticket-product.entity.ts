import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import {
  DeliveryStatus,
  DiscountType,
  PaymentMoneyStatus,
  PickupStrategy,
} from '../common/variable'
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
  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column({ default: PickupStrategy.AutoWithFIFO, type: 'smallint' })
  @Expose()
  pickupStrategy: PickupStrategy

  @Column({ type: 'smallint', default: PaymentMoneyStatus.NoEffect })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  ticketId: number

  @Column({ type: 'varchar', length: 50, default: JSON.stringify([0]) })
  @Expose()
  warehouseIds: string

  @Column()
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  batchId: number // nếu batchId = 0, thì chỉ có thể là autoPick hoặc noImpact

  @Column({ type: 'smallint', default: TicketProductType.Prescription })
  @Expose()
  type: TicketProductType

  @Column({ type: 'smallint', default: DeliveryStatus.Pending })
  @Expose()
  deliveryStatus: DeliveryStatus

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

  @Column({ default: 0 })
  @Expose()
  quantityPrescription: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  printPrescription: number

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
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

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
    entity.quantityPrescription = Number(raw.quantityPrescription)
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

export type TicketProductRelationType = {
  [P in keyof Pick<TicketProduct, 'ticket' | 'customer' | 'product' | 'batch'>]?: boolean
}

export type TicketProductInsertType = Omit<
  TicketProduct,
  keyof TicketProductRelationType | keyof Pick<TicketProduct, 'id'>
>

export type TicketProductUpdateType = {
  [K in Exclude<
    keyof TicketProduct,
    keyof TicketProductRelationType | keyof Pick<TicketProduct, 'oid' | 'id'>
  >]: TicketProduct[K] | (() => string)
}

export type TicketProductSortType = {
  [P in keyof Pick<TicketProduct, 'oid' | 'id' | 'ticketId' | 'productId' | 'priority'>]?:
  | 'ASC'
  | 'DESC'
}
