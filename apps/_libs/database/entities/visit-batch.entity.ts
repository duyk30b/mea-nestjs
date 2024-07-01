import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Batch from './batch.entity'
import Product from './product.entity'
import VisitProduct from './visit-product.entity'
import Visit from './visit.entity'

@Entity('VisitBatch')
@Index('IDX_VisitBatch__oid_visitId', ['oid', 'visitId'])
export default class VisitBatch extends BaseEntity {
  @Column()
  @Expose()
  visitId: number

  @Column()
  @Expose()
  productId: number

  @Column()
  @Expose()
  batchId: number

  @Column()
  @Expose()
  visitProductId: number

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
  @ManyToOne((type) => Visit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitId', referencedColumnName: 'id' })
  visit: Visit

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  @Expose()
  @ManyToOne((type) => VisitProduct, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'visitProductId', referencedColumnName: 'id' })
  visitProduct: VisitProduct

  static fromRaw(raw: { [P in keyof VisitBatch]: any }) {
    if (!raw) return null
    const entity = new VisitBatch()
    Object.assign(entity, raw)

    entity.quantity = Number(raw.quantity)

    return entity
  }

  static fromRaws(raws: { [P in keyof VisitBatch]: any }[]) {
    return raws.map((i) => VisitBatch.fromRaw(i))
  }
}

export type VisitBatchRelationType = Pick<
  VisitBatch,
  'visit' | 'product' | 'batch' | 'visitProduct'
>

export type VisitBatchSortType = Pick<VisitBatch, 'oid' | 'id' | 'visitId' | 'productId'>

export type VisitBatchInsertType = Omit<
  VisitBatch,
  keyof VisitBatchRelationType | keyof Pick<VisitBatch, 'id'>
>

export type VisitBatchUpdateType = Omit<
  VisitBatch,
  keyof VisitBatchRelationType | keyof Pick<VisitBatch, 'oid' | 'id'>
>
