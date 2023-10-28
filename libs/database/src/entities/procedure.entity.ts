import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('procedure')
export default class Procedure extends BaseEntity {
	@Column({ name: 'name' })
	@Expose({ name: 'name' })
	name: string                                                 // Tên dịch vụ

	@Column({ name: 'group', nullable: true })
	@Expose({ name: 'group' })
	group: string                                                  // Nhóm dịch vụ ...

	@Column({ name: 'price', nullable: true })
	@Expose({ name: 'price' })
	price: number                                                  // Giá dự kiến

	@Column({ name: 'consumable_hint', type: 'text', nullable: true })
	@Expose({ name: 'consumable_hint' })
	consumableHint: string                                            // Gợi ý vậy tư tiêu hao

	@Column({ name: 'is_active', type: 'boolean', default: true })
	@Expose({ name: 'is_active' })
	isActive: boolean
}
