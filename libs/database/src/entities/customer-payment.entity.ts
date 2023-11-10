import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { PaymentType } from '../common/variable'
import Invoice from './invoice.entity'

@Entity('customer_payment')
@Index('IDX_CUSTOMER_PAYMENT__CUSTOMER_ID', ['oid', 'customerId'])
@Index('IDX_CUSTOMER_PAYMENT__INVOICE_ID', ['oid', 'invoiceId'])
export default class CustomerPayment extends BaseEntity {
	@Column({ name: 'customer_id' })
	@Expose({ name: 'customer_id' })
	customerId: number

	@Column({ name: 'invoice_id', default: 0 })
	@Expose({ name: 'invoice_id' })
	invoiceId: number

	@Column({
		name: 'time',
		type: 'bigint',
		transformer: { to: (value) => value, from: (value) => Number(value) },
	})
	@Expose({ name: 'time' })
	time: number

	@Column({ name: 'type', type: 'tinyint' })
	@Expose({ name: 'type' })
	type: PaymentType

	@Column({ name: 'paid', default: 0 })// Trả nợ thì: paid = 0 - debit
	@Expose({ name: 'paid' })            // VD: Đơn 1tr, paid = 300 ==> debit = 700
	paid: number                         // Số tiền thanh toán

	@Column({ name: 'open_debt', nullable: true })
	@Expose({ name: 'open_debt' })
	openDebt: number                     // Công nợ đầu kỳ

	@Column({ name: 'debit', default: 0 })
	@Expose({ name: 'debit' })           // Thanh toán trước không ghi nợ: debit = 0     
	debit: number                        // Ghi nợ: tiền nợ thêm hoặc trả nợ

	@Column({ name: 'close_debt', nullable: true })
	@Expose({ name: 'close_debt' })      // openDebt + debit = closeDebt
	closeDebt: number                    // Công nợ cuối kỳ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                         // Ghi chú

	@Column({ name: 'description', nullable: true })
	@Expose({ name: 'description' })
	description: string

	@Expose({ name: 'invoice' })
	@ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'invoice_id', referencedColumnName: 'id' })
	invoice: Invoice
}
