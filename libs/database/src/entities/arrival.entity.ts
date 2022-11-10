import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Customer from './customer.entity'
import Diagnosis from './diagnosis.entity'
import Invoice from './invoice.entity'
import { ArrivalStatus, ArrivalType, PaymentStatus } from '../common/variable'

@Entity('arrival')
@Index(['oid'])
@Index(['oid', 'createTime'])
@Index(['oid', 'customerId', 'createTime'])
export default class Arrival extends BaseEntity {
	@Column({ name: 'customer_id', nullable: true })
	@Expose({ name: 'customer_id' })
	customerId: number

	@Column({ name: 'diagnosis_id', nullable: true })
	@Expose({ name: 'diagnosis_id' })
	diagnosisId: number

	@Column({ name: 'type', type: 'tinyint', default: 0 })
	@Expose({ name: 'type' })
	type: ArrivalType

	@Column({ name: 'status', type: 'tinyint', default: 0 })
	@Expose({ name: 'status' })
	status: ArrivalStatus

	@Column({ name: 'payment_status', type: 'tinyint', default: 0 })
	@Expose({ name: 'payment_status' })
	paymentStatus: PaymentStatus

	@Column({
		name: 'create_time',
		type: 'bigint',
		nullable: true,
		transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number // Giờ vào khám

	@Column({
		name: 'end_time',
		type: 'bigint',
		nullable: true,
		transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
	})
	@Expose({ name: 'end_time' })
	endTime: number // Giờ kết thúc khám

	@Column({ name: 'total_money', default: 0 })
	@Expose({ name: 'total_money' })
	totalMoney: number                                        // tổng tiền 

	@Column({ name: 'profit', default: 0 })
	@Expose({ name: 'profit' })
	profit: number                                            // tiền lãi = Doanh thu - tiền cost - khoản chi

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                              // tiền nợ

	@ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
	@Expose({ name: 'customer' })
	customer: Customer

	@Expose({ name: 'invoices' })
	@OneToMany(() => Invoice, (invoice) => invoice.arrival)
	invoices: Invoice[]

	@Expose({ name: 'diagnosis' })
	diagnosis: Diagnosis
}
