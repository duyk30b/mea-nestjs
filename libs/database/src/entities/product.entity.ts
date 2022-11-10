import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import ProductBatch from './product-batch.entity'

@Entity('product')
@Index(['oid', 'brandName'])
@Index(['oid', 'substance'])
@Index(['oid', 'group'])
@Index(['oid', 'isActive'])
export default class Product extends BaseEntity {
	@Column({ name: 'brand_name' })
	@Expose({ name: 'brand_name' })
	brandName: string                                              // Tên biệt dược

	@Column({ name: 'substance', nullable: true })
	@Expose({ name: 'substance' })
	substance: string                                              // Hoạt chất

	@Column({ name: 'group', nullable: true })
	@Expose({ name: 'group' })
	group: string                                                  // Nhóm thuốc: kháng sinh, dinh dưỡng ...

	@Column({ name: 'unit', nullable: true })
	@Expose({ name: 'unit' })
	unit: string                                                   // Đơn vị tính: lọ, ống, vỉ

	@Column({ name: 'route', nullable: true })
	@Expose({ name: 'route' })
	route: string                                                  // Đường dùng: uống, tiêm, ...

	@Column({ name: 'source', nullable: true })
	@Expose({ name: 'source' })
	source: string                                                 // Nguồn gốc: ... Ấn Độ, Ý, Pháp, ...

	@Column({ name: 'image', nullable: true })
	@Expose({ name: 'image' })
	image: string

	@Column({ name: 'hint_usage', nullable: true })
	@Expose({ name: 'hint_usage' })
	hintUsage: string                                             // Gợi ý cách sử dụng

	@Column({ name: 'is_active', type: 'boolean', default: true })
	@Expose({ name: 'is_active' })
	isActive: boolean

	@Expose({ name: 'product_batches' })
	@OneToMany(() => ProductBatch, (productBatch) => productBatch.product)
	productBatches: ProductBatch[]
}
