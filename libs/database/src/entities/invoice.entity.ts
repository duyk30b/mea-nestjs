import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, PaymentStatus } from '../common/variable'
import Arrival from './arrival.entity'
import Customer from './customer.entity'
import InvoiceItem from './invoice-item.entity'

@Entity('invoice')
@Index(['oid', 'customerId'])
@Index(['oid', 'arrivalId'])
@Index(['oid', 'paymentTime'])
export default class Invoice extends BaseEntity {
	@Column({ name: 'arrival_id', default: 0 })
	@Expose({ name: 'arrival_id' })
	arrivalId: number

	@Column({ name: 'customer_id' })
	@Expose({ name: 'customer_id' })
	customerId: number

	@Column({ name: 'payment_status', type: 'tinyint' })
	@Expose({ name: 'payment_status' })
	paymentStatus: PaymentStatus

	@Column({
		name: 'payment_time',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'payment_time' })
	paymentTime: number

	@Column({
		name: 'refund_time',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'refund_time' })
	refundTime: number

	@Column({ name: 'total_cost_money' })
	@Expose({ name: 'total_cost_money' })
	totalCostMoney: number    						          // tổng tiền cost = tổng cost sản phẩm    

	@Column({ name: 'total_item_money' })
	@Expose({ name: 'total_item_money' })
	totalItemMoney: number                                    // totalItemProduct + totalItemProcedure

	@Column({ name: 'discount_money', default: 0 })
	@Expose({ name: 'discount_money' })
	discountMoney: number                                     // tiền giảm giá

	@Column({ name: 'discount_percent', default: 0 })
	@Expose({ name: 'discount_percent' })
	discountPercent: number                                   // % giảm giá

	@Column({ name: 'discount_type', type: 'enum', enum: DiscountType, default: DiscountType.VND })
	@Expose({ name: 'discount_type' })
	discountType: DiscountType                                // Loại giảm giá

	@Column({ name: 'surcharge', default: 0 })
	@Expose({ name: 'surcharge' })
	surcharge: number                                         // phụ phí

	@Column({ name: 'total_money' })
	@Expose({ name: 'total_money' })
	totalMoney: number                                        // Doanh thu = totalItemMoney + phụ phí - tiền giảm giá

	@Column({ name: 'expenses', default: 0 })                 // Khoản chi (người bán trả): Ví dụ: chi phí ship người bán trả, chi phí thuê người trông, tiền vé xe ...
	@Expose({ name: 'expenses' })                             // Mục này sinh ra để tính lãi cho chính xác, nghĩa là để trừ cả các chi phí sinh ra khi tạo đơn
	expenses: number                                          // Mục này sẽ không hiện trong đơn hàng, khách hàng ko nhìn thấy

	@Column({ name: 'profit' })
	@Expose({ name: 'profit' })
	profit: number                                            // tiền lãi = Doanh thu - tiền cost - khoản chi

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                              // tiền nợ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                              // Ghi chú

	@Expose({ name: 'customer' })
	@ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
	customer: Customer

	@Expose({ name: 'arrival' })
	@ManyToOne((type) => Arrival, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'arrival_id', referencedColumnName: 'id' })
	arrival: Arrival

	@Expose({ name: 'invoice_items' })
	@OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
	invoiceItems: InvoiceItem[]
}
