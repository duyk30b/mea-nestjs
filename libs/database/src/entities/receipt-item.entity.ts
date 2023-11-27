import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { UnitType } from '../common/variable'
import ProductBatch from './product-batch.entity'
import Receipt from './receipt.entity'

@Entity('ReceiptItem')
@Index('IDX_ReceiptItem__oid_productBatchId', ['oid', 'productBatchId'])
@Index('IDX_ReceiptItem__oid_receiptId', ['oid', 'receiptId'])
export default class ReceiptItem extends BaseEntity {
    @Column()
    @Expose()
    receiptId: number

    @Column()
    @Expose()
    distributorId: number

    @Column()
    @Expose()
    productBatchId: number

    @Column({ name: 'unit', type: 'simple-json', default: '{"name":"","rate":1}' })
    @Expose()
    unit: UnitType

    @Column()
    @Expose()
    quantity: number

    @Expose()
    @ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'receiptId', referencedColumnName: 'id' })
    receipt: Receipt

    @Expose()
    @ManyToOne((type) => ProductBatch, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'productBatchId', referencedColumnName: 'id' })
    productBatch: ProductBatch
}
