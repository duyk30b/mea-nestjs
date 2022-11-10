import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class ProductBatchInsertBody {
	@ApiPropertyOptional({ name: 'product_id', example: 12 })
	@Expose({ name: 'product_id' })
	@IsNumber()
	productId: number

	@ApiPropertyOptional({ name: 'batch', example: 'ABC12345' })
	@Expose({ name: 'batch' })
	@IsDefined()
	@IsString()
	batch: string

	@ApiPropertyOptional({ name: 'expiry_date', example: 1679995369195 })
	@Expose({ name: 'expiry_date' })
	@IsNumber()
	expiryDate: number

	@ApiPropertyOptional({ name: 'cost_price', example: 20_000 })
	@Expose({ name: 'cost_price' })
	@IsDefined()
	@IsNumber()
	costPrice: number

	@ApiPropertyOptional({ name: 'retail_price', example: 59_000 })
	@Expose({ name: 'retail_price' })
	@IsNumber()
	retailPrice: number

	@ApiPropertyOptional({ name: 'wholesale_price', example: 45_000 })
	@Expose({ name: 'wholesale_price' })
	@IsNumber()
	wholesalePrice: number
}

export class ProductBatchUpdateBody extends OmitType(ProductBatchInsertBody, ['costPrice', 'productId']) {
}
