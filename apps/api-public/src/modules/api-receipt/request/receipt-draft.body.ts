import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { DiscountType } from '_libs/database/common/variable'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator'
import { ReceiptItemBody } from './receipt-item.body'

export class ReceiptDraftCreateBody {
	@ApiPropertyOptional({ name: 'distributor_id', example: 52 })
	@Expose({ name: 'distributor_id' })
	@IsDefined()
	@IsNumber()
	distributorId: number

	@ApiProperty({ type: ReceiptItemBody, isArray: true })
	@Expose({ name: 'receipt_items' })
	@IsDefined()
	@Type(() => ReceiptItemBody)
	@ValidateNested({ each: true })
	receiptItems: ReceiptItemBody[]

	@ApiPropertyOptional({ name: 'create_time' })
	@Expose({ name: 'create_time' })
	@Type(() => Number)
	@IsNumber()
	createTime: number

	@ApiPropertyOptional({ name: 'total_item_money', example: 50_000 })
	@Expose({ name: 'total_item_money' })
	@IsDefined()
	@IsNumber()
	totalItemMoney: number

	@ApiPropertyOptional({ name: 'discount_money', example: 80000 })
	@Expose({ name: 'discount_money' })
	@IsDefined()
	@IsNumber()
	discountMoney: number

	@ApiPropertyOptional({ name: 'discount_percent', example: 10 })
	@Expose({ name: 'discount_percent' })
	@IsDefined()
	@IsNumber()
	discountPercent: number

	@ApiProperty({ name: 'discount_type', enum: DiscountType, example: DiscountType.VND })
	@Expose({ name: 'discount_type' })
	@IsDefined()
	@IsEnum(DiscountType)
	discountType: DiscountType

	@ApiPropertyOptional({ name: 'surcharge', example: 50_000 })
	@Expose({ name: 'surcharge' })
	@IsDefined()
	@IsNumber()
	surcharge: number

	@ApiProperty({ name: 'total_money', example: 1_250_000 })
	@Expose({ name: 'total_money' })
	@IsDefined()
	@IsNumber()
	totalMoney: number

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng còn bo thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}

export class ReceiptDraftUpdateBody extends OmitType(ReceiptDraftCreateBody, ['distributorId']) { }
