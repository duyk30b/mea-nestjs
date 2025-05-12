import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Batch from './batch.entity'
import Product from './product.entity'
import StockCheck from './stock-check.entity'

@Entity('StockCheckItem')
@Index('IDX_StockCheckItem__oid_stockCheckId', ['oid', 'stockCheckId'])
export default class StockCheckItem {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column()
  @Expose()
  stockCheckId: number

  @Column({ default: 0 })
  @Expose()
  productId: number

  @Column()
  @Expose()
  batchId: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  systemQuantity: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualQuantity: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  systemCostAmount: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualCostAmount: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Expose()
  @ManyToOne(() => StockCheck, (stockCheck) => stockCheck.stockCheckItemList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'stockCheckId', referencedColumnName: 'id' })
  stockCheck: StockCheck

  @Expose()
  @ManyToOne((type) => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product

  @Expose()
  @ManyToOne((type) => Batch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'batchId', referencedColumnName: 'id' })
  batch: Batch

  static fromRaw(raw: { [P in keyof StockCheckItem]: any }) {
    if (!raw) return null
    const entity = new StockCheckItem()
    Object.assign(entity, raw)

    entity.systemQuantity = Number(raw.systemQuantity)
    entity.actualQuantity = Number(raw.actualQuantity)

    return entity
  }

  static fromRaws(raws: { [P in keyof StockCheckItem]: any }[]) {
    return raws.map((i) => StockCheckItem.fromRaw(i))
  }
}

export type StockCheckItemRelationType = {
  [P in keyof Pick<StockCheckItem, 'stockCheck' | 'product' | 'batch'>]?: boolean
}

export type StockCheckItemInsertType = Omit<
  StockCheckItem,
  keyof StockCheckItemRelationType | keyof Pick<StockCheckItem, 'id'>
>

export type StockCheckItemUpdateType = {
  [K in Exclude<
    keyof StockCheckItem,
    keyof StockCheckItemRelationType | keyof Pick<StockCheckItem, 'oid' | 'id'>
  >]: StockCheckItem[K] | (() => string)
}

export type StockCheckItemSortType = {
  [P in keyof Pick<StockCheckItem, 'id' | 'stockCheckId'>]?: 'ASC' | 'DESC'
}
