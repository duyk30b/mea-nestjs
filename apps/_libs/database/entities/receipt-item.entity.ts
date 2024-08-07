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
  productId: number

  @Column()
  @Expose()
  batchId: number

  @Column({ type: 'character varying', length: 255, default: '' })
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
  @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
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
    entity.wholesalePrice = Number(raw.wholesalePrice)
    entity.retailPrice = Number(raw.retailPrice)
    entity.quantity = Number(raw.quantity)

    return entity
  }

  static fromRaws(raws: { [P in keyof ReceiptItem]: any }[]) {
    return raws.map((i) => ReceiptItem.fromRaw(i))
  }
}

export type ReceiptItemRelationType = Pick<ReceiptItem, 'receipt' | 'batch' | 'product'>

export type ReceiptItemInsertType = Omit<
  ReceiptItem,
  keyof ReceiptItemRelationType | keyof Pick<ReceiptItem, 'id'>
>

export type ReceiptItemUpdateType = Omit<
  ReceiptItem,
  keyof ReceiptItemRelationType | keyof Pick<ReceiptItem, 'id' | 'oid'>
>
