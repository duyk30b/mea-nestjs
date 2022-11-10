import { Exclude, Expose, Type } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { EGender, ERole } from '../common/variable'
import Organization from './organization.entity'

@Entity('employee')
@Index('IDX_EMPLOYEE__OID_USERNAME', ['oid', 'username'], { unique: true })
export default class Employee extends BaseEntity {
	@ManyToOne((type) => Organization, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'oid', referencedColumnName: 'id' })
	@Expose({ name: 'organization' })
	organization: Organization

	@Column({ name: 'phone', type: 'char', length: 10, nullable: true })
	@Expose({ name: 'phone' })
	phone: string

	@Column({ name: 'username' })
	@Expose({ name: 'username' })
	username: string

	@Column({ name: 'password' })
	@Exclude()
	password: string

	@Column({ name: 'secret', nullable: true })
	@Exclude()
	secret: string

	@Column({ name: 'role', type: 'tinyint', default: ERole.User })
	@Expose({ name: 'role' })
	role: ERole

	@Column({ name: 'full_name', nullable: true })
	@Expose({ name: 'full_name' })
	fullName: string

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
}
