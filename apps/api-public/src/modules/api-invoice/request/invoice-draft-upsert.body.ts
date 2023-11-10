import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { DiscountType } from '_libs/database/common/variable'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator'
import { InvoiceItemBody } from './invoice-item.body'

export class MoneyDetails {
	@Expose({ name: 'key' })
	@IsDefined()
	@IsString()
	key: string

	@Expose({ name: 'name' })
	@IsDefined()
	@IsString()
	name: string

	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number
}

export class InvoiceDraftCreateBody {
	@ApiProperty({ name: 'customer_id', example: 45 })
	@Expose({ name: 'customer_id' })
	@Type(() => Number)
	@IsDefined()
	@IsPositive()
	customerId: number

	@ApiProperty({ type: InvoiceItemBody, isArray: true })
	@Expose({ name: 'invoice_items' })
	@Type(() => InvoiceItemBody)
	@IsDefined()
	@IsArray()
	@ValidateNested({ each: true })
	invoiceItems: InvoiceItemBody[]

	@ApiProperty({ name: 'create_time', example: Date.now() })
	@Expose({ name: 'create_time' })
	@IsDefined()
	@IsNumber()
	createTime: number

	@ApiProperty({ name: 'total_cost_money', example: 750_000 })
	@Expose({ name: 'total_cost_money' })
	@IsDefined()
	@IsNumber()
	totalCostMoney: number                                    // Tổng tiền cost sản phẩm

	@ApiProperty({ name: 'total_item_money', example: 750_000 })
	@Expose({ name: 'total_item_money' })
	@IsDefined()
	@IsNumber()
	totalItemMoney: number                                  // totalItemMoney = totalItemProduct + totalItemProcedure

	@ApiProperty({ name: 'discount_money', example: 22_500 })
	@Expose({ name: 'discount_money' })
	@IsDefined()
	@IsNumber()
	discountMoney: number

	@ApiProperty({ name: 'discount_percent', example: 22_500 })
	@Expose({ name: 'discount_percent' })
	@IsDefined()
	@IsNumber()
	discountPercent: number

	@ApiProperty({ name: 'discount_type', enum: DiscountType, example: DiscountType.VND })
	@Expose({ name: 'discount_type' })
	@IsDefined()
	@IsEnum(DiscountType)
	discountType: DiscountType

	@ApiProperty({ name: 'surcharge', example: 12_000 })
	@Expose({ name: 'surcharge' })
	@IsDefined()
	@IsNumber()
	surcharge: number                                    // Phụ phí

	@ApiPropertyOptional({
		type: MoneyDetails,
		isArray: true,
		example: [{ key: 'xx', name: 'Hoa hồng', money: 10000 }, { key: 'xxe', name: 'Ship', money: 200000 }],
	})
	@Expose({ name: 'surcharge_details' })
	@IsDefined()
	@Type(() => MoneyDetails)
	@IsArray()
	@ValidateNested({ each: true })
	surchargeDetails: MoneyDetails[]                 // Phụ phí

	@ApiProperty({ name: 'total_money', example: 1_250_000 })
	@Expose({ name: 'total_money' })
	@IsDefined()
	@IsNumber()
	totalMoney: number                                    // totalMoney = totalItemMoney - discountMoney + phụ phí

	@ApiProperty({ name: 'expenses', example: 20_000 })
	@Expose({ name: 'expenses' })
	@IsNumber()
	expenses: number                                    // Khoản chi (chi phí phải trả như tiền môi giới)

	@ApiPropertyOptional({
		type: MoneyDetails,
		isArray: true,
		example: [{ key: 'xx', name: 'Vật tư', money: 10000 }, { key: 'xxe', name: 'Ship', money: 200000 }],
	})
	@Expose({ name: 'expenses_details' })
	@IsDefined()
	@Type(() => MoneyDetails)
	@IsArray()
	@ValidateNested({ each: true })
	expensesDetails: MoneyDetails[]

	@ApiProperty({ name: 'profit', example: 20_000 })
	@Expose({ name: 'profit' })
	@IsDefined()
	@IsNumber()
	profit: number                                     // Tiền lãi = totalMoney - totalCostMoney - khoản chi

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng không hài lòng dịch vụ nên không trả tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}

export class InvoiceDraftUpdateBody extends OmitType(InvoiceDraftCreateBody, ['customerId']) { }
