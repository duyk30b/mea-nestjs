import { Expose, Type } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Distributor } from '.'
import { BaseEntity } from '../common/base.entity'
import { DiscountType, PaymentStatus } from '../common/variable'
import Purchase from './purchase.entity'
import ReceiptItem from './receipt-item.entity'

@Entity('receipt')
@Index(['oid', 'purchaseId'])
@Index(['oid', 'paymentTime'])
export default class Receipt extends BaseEntity {
	@Column({ name: 'purchase_id' })
	@Expose({ name: 'purchase_id' })
	purchaseId: number

	@Column({ name: 'distributor_id' })
	@Expose({ name: 'distributor_id' })
	distributorId: number

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

	@Column({ name: 'debt', default: 0 })
	@Expose({ name: 'debt' })
	debt: number                                              // tiền nợ

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                              // Ghi chú

	@Expose({ name: 'receipt_items' })
	@OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.receipt)
	receiptItems: ReceiptItem[]

	@Expose({ name: 'purchase' })
	@ManyToOne((type) => Purchase, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'purchase_id', referencedColumnName: 'id' })
	purchase: Purchase

	@Expose({ name: 'distributor' })
	@ManyToOne((type) => Distributor, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'distributor_id', referencedColumnName: 'id' })
	distributor: Distributor
}
