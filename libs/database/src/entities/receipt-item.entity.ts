import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Receipt from './receipt.entity'
import ProductBatch from './product-batch.entity'

@Entity('receipt_item')
@Index(['oid', 'productBatchId'])
@Index(['oid', 'receiptId'])
export default class ReceiptItem extends BaseEntity {
	@Column({ name: 'receipt_id' })
	@Expose({ name: 'receipt_id' })
	receiptId: number

	@Column({ name: 'product_batch_id' })
	@Expose({ name: 'product_batch_id' })
	productBatchId: number

	@Column({ name: 'unit', default: '{"name":"","rate":1}' })
	@Expose({ name: 'unit' })
	unit: string

	@Column({ name: 'quantity' })
	@Expose({ name: 'quantity' })
	quantity: number

	@Expose({ name: 'receipt' })
	@ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'receipt_id', referencedColumnName: 'id' })
	receipt: Receipt

	@Expose({ name: 'product_batch' })
	@ManyToOne((type) => ProductBatch, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'product_batch_id', referencedColumnName: 'id' })
	productBatch: ProductBatch
}
