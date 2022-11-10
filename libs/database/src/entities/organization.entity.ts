import { Exclude, Expose } from 'class-transformer'
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('organization')
@Index(['phone'], { unique: true })
@Index(['email'], { unique: true })
export default class Organization {
	@PrimaryGeneratedColumn({ name: 'id' })
	@Expose({ name: 'id' })
	id: number

	@Column({ name: 'phone', type: 'char', length: 10, nullable: false })
	@Expose({ name: 'phone' })
	phone: string

	@Column({ name: 'email', nullable: false })
	@Expose({ name: 'email' })
	email: string

	@Column({ name: 'level', type: 'tinyint', default: 0 })
	@Expose({ name: 'level' })
	level: number

	@Column({ name: 'organization_name', nullable: true })
	@Expose({ name: 'organization_name' })
	organizationName: string

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

	@Column({
		name: 'create_time',
		type: 'bigint',
		nullable: true,
		transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number // Giờ vào khám
}
