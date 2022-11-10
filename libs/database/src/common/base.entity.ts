import { Exclude, Expose } from 'class-transformer'
import { Column, PrimaryGeneratedColumn } from 'typeorm'

export class BaseEntity {
	@Column({ name: 'oid' })
	@Exclude()
	oid: number

	@PrimaryGeneratedColumn({ name: 'id' })
	@Expose({ name: 'id' })
	id: number

	@Column({ name: 'other_id', nullable: true })
	@Exclude()
	otherId: string
}
