import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { DiscountType, InvoiceItemType } from '_libs/database/common/variable'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsEnum, IsNumber, IsString, Min, validateSync } from 'class-validator'
import { UnitConversionQuery } from '../../api-product/request'

export class InvoiceItemBody {
	@ApiProperty({ name: 'reference_id', example: 12 })
	@Expose({ name: 'reference_id' })
	@IsDefined()
	@IsNumber()
	referenceId: number

	@ApiPropertyOptional({ name: 'payment_status', enum: valuesEnum(InvoiceItemType), example: InvoiceItemType.ProductBatch })
	@Expose({ name: 'type' })
	@IsDefined()
	@IsEnum(InvoiceItemType)
	type: InvoiceItemType

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
	unit: string                                   // đơn vị tính: lọ, ống, vỉ

	@ApiPropertyOptional({ name: 'cost_price', example: 12_000 })
	@Expose({ name: 'cost_price' })
	@IsDefined()
	@IsNumber()
	costPrice: number

	@ApiProperty({ name: 'expected_price', example: 25_000 })
	@Expose({ name: 'expected_price' })
	@IsDefined()
	@IsNumber()
	expectedPrice: number

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

	@ApiProperty({ name: 'discount_type', enum: valuesEnum(DiscountType), example: DiscountType.VND })
	@Expose({ name: 'discount_type' })
	@IsDefined()
	@IsEnum(DiscountType)
	discountType: DiscountType

	@ApiProperty({ name: 'actual_price', example: 22_500 })
	@Expose({ name: 'actual_price' })
	@IsDefined()
	@IsNumber()
	actualPrice: number

	@ApiProperty({ name: 'quantity', example: 4 })
	@Expose({ name: 'quantity' })
	@IsDefined()
	@IsNumber()
	@Min(1)
	quantity: number
}
