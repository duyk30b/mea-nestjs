import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { DiscountType } from '_libs/database/common/variable'
import { Expose, Transform, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNumber, IsString, Min, ValidateNested, validateSync } from 'class-validator'
import { UnitConversionQuery } from '../../api-product/request'

export class ReceiptItemBody {
	@ApiPropertyOptional({ name: 'product_batch_id', example: 52 })
	@Expose({ name: 'product_batch_id' })
	@IsDefined()
	@IsNumber()
	productBatchId: number

	@ApiPropertyOptional({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' })
	@Expose({ name: 'unit' })
	@Transform(({ value }) => {
		try {
			const instance = Object.assign(new UnitConversionQuery(), JSON.parse(value))
			const validate = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true })
			if (validate.length) return validate
			else return JSON.stringify(instance)
		}
		catch (error) { return [error.message] }
	})
	@IsString({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' })
	unit: string

	@ApiProperty({ name: 'quantity', example: 4 })
	@Expose({ name: 'quantity' })
	@IsDefined()
	@IsNumber()
	@Min(1)
	quantity: number
}

export class ReceiptCreateBody {
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

	@ApiPropertyOptional({ name: 'debt', example: 500_000 })
	@Expose({ name: 'debt' })
	@IsDefined()
	@IsNumber()
	debt: number

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng còn bo thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}

export class ReceiptUpdateBody extends OmitType(ReceiptCreateBody, ['distributorId']) { }
