import { Expose, Type } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, ReceiptStatus } from '../common/variable'
import DistributorPayment from './distributor-payment.entity'
import Distributor from './distributor.entity'
import ReceiptItem from './receipt-item.entity'

@Entity('receipt')
@Index('IDX_RECEIPT__DISTRIBUTOR_ID', ['oid', 'distributorId'])
@Index('IDX_RECEIPT__CREATE_TIME', ['oid', 'createTime'])
export default class Receipt extends BaseEntity {
	@Column({ name: 'distributor_id' })
	@Expose({ name: 'distributor_id' })
	distributorId: number

	@Column({ name: 'status', type: 'tinyint' })
	@Expose({ name: 'status' })
	status: ReceiptStatus

	@Column({
		name: 'create_time',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'create_time' })
	createTime: number

	@Column({
		name: 'delete_time',
		type: 'bigint',
		nullable: true,
		transformer: {
			to: (value) => value,
			from: (value) => value == null ? value : Number(value),
		},
	})
	@Expose({ name: 'delete_time' })
	deleteTime: number

	@Column({ name: 'total_item_money', type: 'bigint' })
	@Expose({ name: 'total_item_money' })
	@Type(() => Number)
	totalItemMoney: number                                   // tiền sản phẩm

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
	surcharge: number                                         // phụ phí: tiền phải trả thêm: như tiền ship, tiền vé, hao phí xăng dầu

	@Column({ name: 'total_money', type: 'bigint' })
	@Expose({ name: 'total_money' })
	@Type(() => Number)
	totalMoney: number                                        // tổng tiền = tiền sản phẩm + surcharge - tiền giảm giá

	@Column({ name: 'paid', default: 0 })
	@Expose({ name: 'paid' })
	paid: number                                           // tiền thanh toán

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                              // tiền nợ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                              // Ghi chú

	@Expose({ name: 'receipt_items' })
	@OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.receipt)
	receiptItems: ReceiptItem[]

	@Expose({ name: 'distributor' })
	@ManyToOne((type) => Distributor, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'distributor_id', referencedColumnName: 'id' })
	distributor: Distributor

	@Expose({ name: 'distributor_payments' })
	@OneToMany(() => DistributorPayment, (distributorPayment) => distributorPayment.receipt)
	distributorPayments: DistributorPayment[]
}
