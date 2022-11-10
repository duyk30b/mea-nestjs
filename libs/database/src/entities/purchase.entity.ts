import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { PaymentStatus } from '../common/variable'
import Distributor from './distributor.entity'
import Receipt from './receipt.entity'

@Entity('purchase')
@Index(['oid'])
@Index(['oid', 'createTime'])
@Index(['oid', 'distributorId', 'createTime'])
export default class Purchase extends BaseEntity {
	@Column({ name: 'distributor_id' })
	@Expose({ name: 'distributor_id' })
	distributorId: number

	@Column({ name: 'payment_status', type: 'tinyint' })
	@Expose({ name: 'payment_status' })
	paymentStatus: PaymentStatus

	@Column({
		name: 'create_time',
		type: 'bigint',
		nullable: true,
		transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number

	@Column({ name: 'total_money', type: 'bigint' })
	@Expose({ name: 'total_money' })
	totalMoney: number                                        // tổng tiền 

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                              // tiền nợ

	@Expose({ name: 'receipts' })
	@OneToMany(() => Receipt, (receipt) => receipt.purchase)
	receipts: Receipt[]

	@Expose({ name: 'distributor' })
	@ManyToOne((type) => Distributor, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'distributor_id', referencedColumnName: 'id' })
	distributor: Distributor
}
