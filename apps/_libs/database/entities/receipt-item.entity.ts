import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Batch from './batch.entity'
import Product from './product.entity'
import Receipt from './receipt.entity'

@Entity('ReceiptItem')
@Index('IDX_ReceiptItem__oid_batchId', ['oid', 'batchId'])
@Index('IDX_ReceiptItem__oid_productId', ['oid', 'productId'])
@Index('IDX_ReceiptItem__oid_receiptId', ['oid', 'receiptId'])
export default class ReceiptItem extends BaseEntity {
  @Column()
  @Expose()
  receiptId: number

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
  batchCode: string // Số Lô sản phẩm

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
  @ManyToOne((type) => Receipt, (receipt) => receipt.receiptItemList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'receiptId', referencedColumnName: 'id' })
  receipt: Receipt

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  static fromRaw(raw: { [P in keyof ReceiptItem]: any }) {
    if (!raw) return null
    const entity = new ReceiptItem()
    Object.assign(entity, raw)
    entity.expiryDate = raw.expiryDate == null ? raw.expiryDate : Number(raw.expiryDate)
    entity.costPrice = Number(raw.costPrice)
    entity.quantity = Number(raw.quantity)

    return entity
  }

  static fromRaws(raws: { [P in keyof ReceiptItem]: any }[]) {
    return raws.map((i) => ReceiptItem.fromRaw(i))
  }
}

export type ReceiptItemRelationType = {
  [P in keyof Pick<ReceiptItem, 'product' | 'batch'>]?: boolean
} & {
  [P in keyof Pick<ReceiptItem, 'receipt'>]?:
  | { [P in keyof Pick<Receipt, 'distributor'>]?: boolean }
  | false
}

export type ReceiptItemInsertType = Omit<
  ReceiptItem,
  keyof ReceiptItemRelationType | keyof Pick<ReceiptItem, 'id'>
>

export type ReceiptItemUpdateType = {
  [K in Exclude<
    keyof ReceiptItem,
    keyof ReceiptItemRelationType | keyof Pick<ReceiptItem, 'oid' | 'id'>
  >]: ReceiptItem[K] | (() => string)
}

export type ReceiptItemSortType = {
  [P in keyof Pick<ReceiptItem, 'id'>]?: 'ASC' | 'DESC'
}
