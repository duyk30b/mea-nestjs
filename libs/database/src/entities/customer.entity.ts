import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { EGender } from '../common/variable'

@Entity('customer')
@Index(['oid', 'fullNameEn'])
@Index(['oid', 'phone'])
@Index(['oid', 'debt'])
export default class Customer extends BaseEntity {
	@Column({ name: 'full_name_en' })
	@Expose({ name: 'full_name_en' })
	fullNameEn: string

	@Column({ name: 'full_name_vi' })
	@Expose({ name: 'full_name_vi' })
	fullNameVi: string

	@Column({ name: 'phone', type: 'char', length: 10, nullable: true })
	@Expose({ name: 'phone' })
	phone: string

	@Column({
		name: 'birthday',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'birthday' })
	birthday: number

	@Column({ name: 'gender', type: 'tinyint', nullable: true })
	@Expose({ name: 'gender' })
	gender: EGender

	@Column({ name: 'identity_card', nullable: true })
	@Expose({ name: 'identity_card' })                                 // số căn cước
	identityCard: string

	@Column({ name: 'address_province', nullable: true })
	@Expose({ name: 'address_province' })
	addressProvince: string

	@Column({ name: 'address_district', nullable: true })
	@Expose({ name: 'address_district' })
	addressDistrict: string

	@Column({ name: 'address_ward', nullable: true })
	@Expose({ name: 'address_ward' })
	addressWard: string

	@Column({ name: 'address_street', nullable: true })
	@Expose({ name: 'address_street' })
	addressStreet: string

	@Column({ name: 'relative', nullable: true })
	@Expose({ name: 'relative' })                                      // người thân
	relative: string

	@Column({ name: 'health_history', type: 'text', nullable: true })
	@Expose({ name: 'health_history' })
	healthHistory: string                                             // Tiền sử bệnh

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                                      // tiền nợ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                      // Ghi chú

	@Column({ name: 'is_active', type: 'boolean', default: true })
	@Expose({ name: 'is_active' })
	isActive: boolean
}
