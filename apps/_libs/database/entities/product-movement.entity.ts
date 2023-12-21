import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Invoice from './invoice.entity'
import ProductBatch from './product-batch.entity'
import Receipt from './receipt.entity'

export enum ProductMovementType {
    Receipt = 1,
    Invoice = 2,
}

@Index('IDX_ProductMovement__oid_productId_createTime', ['oid', 'productId', 'createTime'])
@Index('IDX_ProductMovement__oid_productBatchId_createTime', ['oid', 'productBatchId', 'createTime'])
@Entity('ProductMovement')
export default class ProductMovement extends BaseEntity {
    @Column()
    @Expose()
    productId: number

    @Column()
    @Expose()
    productBatchId: number

    @Column() // ID invoice hoặc ID receipt
    @Expose()
    referenceId: number

    @Column({ type: 'smallint' })
    @Expose()
    type: ProductMovementType

    @Column({ type: 'smallint', default: 0 })
    @Expose()
    isRefund: 0 | 1

    @Column()
    @Expose()
    openQuantity: number // Số lượng ban đầu

    @Column()
    @Expose()
    number: number // Số lượng +/-

    @Column({ type: 'varchar', length: 255, default: '{"name":"","rate":1}' })
    @Expose()
    unit: string

    @Column()
    @Expose()
    closeQuantity: number // Số lượng sau thay đổi

    @Column({
        type: 'bigint',
        default: 0,
        transformer: { to: (value) => value, from: (value) => Number(value) },
    })
    @Expose()
    price: number // Giá

    @Column({
        type: 'bigint',
        default: 0,
        transformer: { to: (value) => value, from: (value) => Number(value) },
    })
    @Expose()
    totalMoney: number // Tổng tiền

    @Column({
        type: 'bigint',
        transformer: { to: (value) => value, from: (value) => Number(value) },
    })
    @Expose()
    createTime: number

    @Expose()
    @ManyToOne((type) => ProductBatch, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'productBatchId', referencedColumnName: 'id' })
    productBatch: ProductBatch

    @Expose()
    @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'referenceId', referencedColumnName: 'id' })
    invoice: Invoice

    @Expose()
    @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'referenceId', referencedColumnName: 'id' })
    receipt: Receipt
}
