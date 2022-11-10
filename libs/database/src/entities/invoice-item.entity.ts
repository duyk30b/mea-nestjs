import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, InvoiceItemType } from '../common/variable'
import Invoice from './invoice.entity'
import Procedure from './procedure.entity'
import ProductBatch from './product-batch.entity'

@Entity('invoice_item')
@Index(['oid', 'invoiceId'])
@Index(['oid', 'customerId', 'type'])
@Index(['oid', 'referenceId'])
export default class InvoiceItem extends BaseEntity {
	@Column({ name: 'invoice_id' })                        // Hóa đơn
	@Expose({ name: 'invoice_id' })
	invoiceId: number

	@Column({ name: 'customer_id' })
	@Expose({ name: 'customer_id' })
	customerId: number

	@Column({ name: 'reference_id' })                      // ID product_batch hoặc id procedure
	@Expose({ name: 'reference_id' })
	referenceId: number

	@Column({ name: 'type', type: 'tinyint' })
	@Expose({ name: 'type' })
	type: InvoiceItemType

	@Column({ name: 'unit', default: '{"name":"","rate":1}' })
	@Expose({ name: 'unit' })
	unit: string

	@Column({ name: 'cost_price', nullable: true })
	@Expose({ name: 'cost_price' })
	costPrice: number                                   // Giá cost

	@Column({ name: 'expected_price', nullable: true })
	@Expose({ name: 'expected_price' })
	expectedPrice: number                                // Giá dự kiến

	@Column({ name: 'discount_money', default: 0 })
	@Expose({ name: 'discount_money' })
	discountMoney: number                                // tiền giảm giá

	@Column({ name: 'discount_percent', default: 0 })
	@Expose({ name: 'discount_percent' })
	discountPercent: number                              // % giảm giá

	@Column({ name: 'discount_type', type: 'enum', enum: DiscountType, default: DiscountType.VND })
	@Expose({ name: 'discount_type' })
	discountType: DiscountType                           // Loại giảm giá

	@Column({ name: 'actual_price' })
	@Expose({ name: 'actual_price' })
	actualPrice: number                                  // Giá thực tế

	@Column({ name: 'quantity', default: 0 })
	@Expose({ name: 'quantity' })
	quantity: number

	@Expose({ name: 'invoice' })
	@ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'invoice_id', referencedColumnName: 'id' })
	invoice: Invoice

	@Expose({ name: 'product_batch' })
	@ManyToOne((type) => ProductBatch, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'reference_id', referencedColumnName: 'id' })
	productBatch: ProductBatch

	@Expose({ name: 'procedure' })
	@ManyToOne((type) => Procedure, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'reference_id', referencedColumnName: 'id' })
	procedure: Procedure
}
