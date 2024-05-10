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

  @Column({ type: 'varchar', length: 255, default: '{"name":"","rate":1}' })
  @Expose()
  unit: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  costPrice: number // Giá cost

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  quantity: number

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
}
