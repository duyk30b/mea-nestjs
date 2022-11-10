import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DebtType } from '../common/variable'

@Entity('distributor_debt')
@Index(['oid', 'distributorId'])
export default class DistributorDebt extends BaseEntity {
	@Column({ name: 'distributor_id' })
	@Expose({ name: 'distributor_id' })
	distributorId: number

	@Column({ name: 'receipt_id', default: 0 })
	@Expose({ name: 'receipt_id' })
	receiptId: number

	@Column({ name: 'type', type: 'tinyint' })
	@Expose({ name: 'type' })
	type: DebtType

	@Column({ name: 'open_debt' })
	@Expose({ name: 'open_debt' })
	openDebt: number                                  // Dư nợ đầu kỳ

	@Column({ name: 'money' })
	@Expose({ name: 'money' })
	money: number                               // tiền nợ thêm hoặc trả nợ

	@Column({ name: 'close_debt' })
	@Expose({ name: 'close_debt' })
	closeDebt: number                                  // Dư nợ cuối kỳ

	@Column({
		name: 'create_time',
		type: 'bigint',
		transformer: { to: (value) => value, from: (value) => Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                          // Ghi chú
}
