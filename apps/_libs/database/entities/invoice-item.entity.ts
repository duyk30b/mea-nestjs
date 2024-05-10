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

  @Column({ type: 'varchar', length: 255, default: '{"name":"","rate":1}' })
  @Expose()
  unit: string

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costPrice: number // Giá cost

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

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  quantity: number

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
  @ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureId', referencedColumnName: 'id' })
  procedure: Procedure

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product
}
