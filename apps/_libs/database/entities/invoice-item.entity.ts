import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, InvoiceItemType } from '../common/variable'
import Batch from './batch.entity'
import Invoice from './invoice.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'

@Entity('InvoiceItem')
@Index('IDX_InvoiceItem__invoiceId', ['oid', 'invoiceId'])
@Index('IDX_InvoiceItem__customerId_type', ['oid', 'customerId', 'type'])
@Index('IDX_InvoiceItem__oid_productId', ['oid', 'productId'])
@Index('IDX_InvoiceItem__oid_batchId', ['oid', 'batchId'])
@Index('IDX_InvoiceItem__oid_procedureId', ['oid', 'procedureId'])
export default class InvoiceItem extends BaseEntity {
  @Column() // Hóa đơn
  @Expose()
  invoiceId: number

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  productId: number

  @Column({ default: 0 })
  @Expose()
  batchId: number

  @Column({ default: 0 })
  @Expose()
  procedureId: number

  @Column({ type: 'smallint' })
  @Expose()
  type: InvoiceItemType

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

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costAmount: number // Giá cost

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

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ type: 'varchar', length: 255, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number // Giá thực tế

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  hintUsage: string

  @Expose()
  @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'invoiceId', referencedColumnName: 'id' })
  invoice: Invoice

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureId', referencedColumnName: 'id' })
  procedure: Procedure

  static fromRaw(raw: { [P in keyof InvoiceItem]: any }) {
    if (!raw) return null
    const entity = new InvoiceItem()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)
    entity.costAmount = Number(raw.costAmount)
    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    return entity
  }

  static fromRaws(raws: { [P in keyof InvoiceItem]: any }[]) {
    return raws.map((i) => InvoiceItem.fromRaw(i))
  }
}

export type InvoiceItemRelationType = Pick<
  InvoiceItem,
  'invoice' | 'batch' | 'product' | 'procedure'
>

export type InvoiceItemInsertType = Omit<
  InvoiceItem,
  keyof InvoiceItemRelationType | keyof Pick<InvoiceItem, 'id'>
>

export type InvoiceItemUpdateType = Omit<
  InvoiceItem,
  keyof InvoiceItemRelationType | keyof Pick<InvoiceItem, 'id' | 'oid'>
>
