import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('procedure')
@Index(['oid', 'nameEn'])
export default class Procedure extends BaseEntity {
	@Column({ name: 'name_en', nullable: true })
	@Expose({ name: 'name_en' })
	nameEn: string                                                 // Tên dịch vụ

	@Column({ name: 'name_vi', nullable: true })
	@Expose({ name: 'name_vi' })
	nameVi: string                                                 // Tên dịch vụ

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
