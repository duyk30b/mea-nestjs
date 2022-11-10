import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DiscountType } from '_libs/database/common/variable'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'
import { InvoiceItemBody } from './invoice-item.body'

export class InvoiceCreateQuery {
	@ApiProperty({ name: 'customer_id', example: 45 })
	@Expose({ name: 'customer_id' })
	@IsDefined()
	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	customerId: number
}

export class InvoiceUpsertBody {
	@ApiProperty({ type: InvoiceItemBody, isArray: true })
	@Expose({ name: 'invoice_items' })
	@IsDefined()
	@IsArray()
	@Type(() => InvoiceItemBody)
	@ValidateNested({ each: true })
	invoiceItems: InvoiceItemBody[]

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

	@ApiPropertyOptional({ name: 'surcharge', example: 12_000 })
	@Expose({ name: 'surcharge' })
	@IsDefined()
	@IsNumber()
	surcharge: number                                    // Phụ phí

	@ApiPropertyOptional({ name: 'total_money', example: 1_250_000 })
	@Expose({ name: 'total_money' })
	@IsDefined()
	@IsNumber()
	totalMoney: number                                    // totalMoney = totalItemMoney - discountMoney + phụ phí

	@ApiPropertyOptional({ name: 'expenses', example: 20_000 })
	@Expose({ name: 'expenses' })
	@IsDefined()
	@IsNumber()
	expenses: number                                    // Khoản chi (chi phí phải trả như tiền môi giới)

	@ApiPropertyOptional({ name: 'profit', example: 20_000 })
	@Expose({ name: 'profit' })
	@IsDefined()
	@IsNumber()
	profit: number                                     // Tiền lãi = totalMoney - totalCostMoney - khoản chi

	@ApiPropertyOptional({ name: 'debt', example: 500_000 })
	@Expose({ name: 'debt' })
	@IsDefined()
	@IsNumber()
	debt: number                                      // Nợ

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng không hài lòng dịch vụ nên không trả tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}
