import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import Batch from './batch.entity'
import Product from './product.entity'
import PurchaseOrder from './purchase-order.entity'

@Entity('PurchaseOrderItem')
@Index('IDX_PurchaseOrderItem__oid_productId', ['oid', 'productId'])
@Index('IDX_PurchaseOrderItem__oid_purchaseOrderId', ['oid', 'purchaseOrderId'])
export default class PurchaseOrderItem {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  purchaseOrderId: string

  @Column()
  @Expose()
  distributorId: number

  @Column({ default: 0 })
  @Expose()
  warehouseId: number

  @Column({ default: 0 })
  @Expose()
  productId: number

  @Column()
  @Expose()
  batchId: number

  @Column({ type: 'varchar', length: 50, default: '' })
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
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costPrice: number // Giá cost

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  listPrice: number // Giá cost

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  quantity: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  unitRate: number

  @Expose()
  @ManyToOne((type) => PurchaseOrder, (purchaseOrder) => purchaseOrder.purchaseOrderItemList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'purchaseOrderId', referencedColumnName: 'id' })
  purchaseOrder: PurchaseOrder

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  static fromRaw(raw: { [P in keyof PurchaseOrderItem]: any }) {
    if (!raw) return null
    const entity = new PurchaseOrderItem()
    Object.assign(entity, raw)
    entity.expiryDate = raw.expiryDate == null ? raw.expiryDate : Number(raw.expiryDate)
    entity.costPrice = Number(raw.costPrice)
    entity.quantity = Number(raw.quantity)

    return entity
  }

  static fromRaws(raws: { [P in keyof PurchaseOrderItem]: any }[]) {
    return raws.map((i) => PurchaseOrderItem.fromRaw(i))
  }
}

export type PurchaseOrderItemRelationType = {
  [P in keyof Pick<PurchaseOrderItem, 'product' | 'batch'>]?: boolean
} & {
  [P in keyof Pick<PurchaseOrderItem, 'purchaseOrder'>]?:
  | { [P in keyof Pick<PurchaseOrder, 'distributor'>]?: boolean }
  | false
}

export type PurchaseOrderItemInsertType = Omit<
  PurchaseOrderItem,
  keyof PurchaseOrderItemRelationType | keyof Pick<PurchaseOrderItem, never>
>

export type PurchaseOrderItemUpdateType = {
  [K in Exclude<
    keyof PurchaseOrderItem,
    keyof PurchaseOrderItemRelationType | keyof Pick<PurchaseOrderItem, 'oid' | 'id'>
  >]: PurchaseOrderItem[K] | (() => string)
}

export type PurchaseOrderItemSortType = {
  [P in keyof Pick<PurchaseOrderItem, 'id'>]?: 'ASC' | 'DESC'
}
