import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { ProductMovementType } from '../common/variable'
import Invoice from './invoice.entity'
import ProductBatch from './product-batch.entity'
import Receipt from './receipt.entity'

@Index(['oid', 'productId', 'createTime'])
@Index(['oid', 'productBatchId', 'createTime'])
@Entity('product_movement')
export default class ProductMovement extends BaseEntity {
	@Column({ name: 'product_id' })
	@Expose({ name: 'product_id' })
	productId: number

	@Column({ name: 'product_batch_id' })
	@Expose({ name: 'product_batch_id' })
	productBatchId: number

	@Column({ name: 'reference_id' })                      // ID invoice hoặc ID receipt
	@Expose({ name: 'reference_id' })
	referenceId: number

	@Column({ name: 'type', type: 'tinyint' })
	@Expose({ name: 'type' })
	type: ProductMovementType

	@Column({ name: 'is_refund', type: 'boolean', default: false })
	@Expose({ name: 'is_refund' })
	isRefund: boolean

	@Column({ name: 'open_quantity' })
	@Expose({ name: 'open_quantity' })
	openQuantity: number                                  // Số lượng ban đầu

	@Column({ name: 'number' })
	@Expose({ name: 'number' })
	number: number                                        // Số lượng +/-

	@Column({ name: 'close_quantity' })
	@Expose({ name: 'close_quantity' })
	closeQuantity: number                                 // Số lượng sau thay đổi

	@Column({ name: 'price', default: 0 })
	@Expose({ name: 'price' })
	price: number                                        // Giá

	@Column({ name: 'total_money', default: 0 })
	@Expose({ name: 'total_money' })
	totalMoney: number                                   // Tổng tiền

	@Column({
		name: 'create_time',
		type: 'bigint',
		transformer: { to: (value) => value, from: (value) => Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number

	@Expose({ name: 'product_batch' })
	@ManyToOne((type) => ProductBatch, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'product_batch_id', referencedColumnName: 'id' })
	productBatch: ProductBatch

	@Expose({ name: 'invoice' })
	@ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'reference_id', referencedColumnName: 'id' })
	invoice: Invoice

	@Expose({ name: 'receipt' })
	@ManyToOne((type) => Receipt, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'reference_id', referencedColumnName: 'id' })
	receipt: Receipt
}
