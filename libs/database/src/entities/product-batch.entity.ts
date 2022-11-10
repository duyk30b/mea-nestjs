import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Product from './product.entity'

@Entity('product_batch')
@Index(['oid', 'productId'])
export default class ProductBatch extends BaseEntity {
	@Column({ name: 'product_id' })
	@Expose({ name: 'product_id' })
	productId: number

	@Column({ name: 'batch', default: '' })
	@Expose({ name: 'batch' })
	batch: string                               // Lô sản phẩm

	@Column({
		name: 'expiry_date',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'expiry_date' })
	expiryDate: number

	@Column({ name: 'cost_price', default: 0 })
	@Expose({ name: 'cost_price' })
	costPrice: number                               // Giá nhập

	@Column({ name: 'wholesale_price', default: 0 })
	@Expose({ name: 'wholesale_price' })
	wholesalePrice: number                          // Giá bán sỉ

	@Column({ name: 'retail_price', default: 0 })
	@Expose({ name: 'retail_price' })
	retailPrice: number                             // Giá bán lẻ

	@Column({ name: 'quantity', default: 0 })
	@Expose({ name: 'quantity' })
	quantity: number

	@Expose({ name: 'product' })
	@ManyToOne((type) => Product, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
	product: Product
}
