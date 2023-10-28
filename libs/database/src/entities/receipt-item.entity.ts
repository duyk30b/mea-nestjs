import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { UnitType } from '../common/variable'
import ProductBatch from './product-batch.entity'
import Receipt from './receipt.entity'

@Entity('receipt_item')
@Index(['oid', 'productBatchId'])
@Index(['oid', 'receiptId'])
export default class ReceiptItem extends BaseEntity {
	@Column({ name: 'receipt_id' })
	@Expose({ name: 'receipt_id' })
	receiptId: number

	@Column({ name: 'distributor_id' })
	@Expose({ name: 'distributor_id' })
	distributorId: number

	@Column({ name: 'product_batch_id' })
	@Expose({ name: 'product_batch_id' })
	productBatchId: number

	@Column({ name: 'unit', type: 'simple-json', default: '{"name":"","rate":1}' })
	@Expose({ name: 'unit' })
	unit: UnitType

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
