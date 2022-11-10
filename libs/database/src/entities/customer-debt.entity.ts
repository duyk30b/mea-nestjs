import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DebtType } from '../common/variable'

@Entity('customer_debt')
@Index(['oid', 'customerId'])
export default class CustomerDebt extends BaseEntity {
	@Column({ name: 'customer_id' })
	@Expose({ name: 'customer_id' })
	customerId: number

	@Column({ name: 'invoice_id', default: 0 })
	@Expose({ name: 'invoice_id' })
	invoiceId: number

	@Column({ name: 'type', type: 'tinyint' })
	@Expose({ name: 'type' })
	type: DebtType

	@Column({
		name: 'create_time',
		type: 'bigint',
		transformer: { to: (value) => value, from: (value) => Number(value) },
	})
	@Expose({ name: 'create_time' })
	createTime: number

	@Column({ name: 'open_debt' })
	@Expose({ name: 'open_debt' })
	openDebt: number                                  // Dư nợ đầu kỳ

	@Column({ name: 'money' })
	@Expose({ name: 'money' })
	money: number                                     // tiền nợ thêm hoặc trả nợ

	@Column({ name: 'close_debt' })
	@Expose({ name: 'close_debt' })
	closeDebt: number                                 // Dư nợ cuối kỳ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                      // Ghi chú
}
