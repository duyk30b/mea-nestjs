import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'

export class ProductMovementFilterQuery {
	@ApiPropertyOptional({ name: 'filter[product_id]' })
	@Expose({ name: 'product_id' })
	@Type(() => Number)
	@IsNumber()
	productId: number

	@ApiPropertyOptional({ name: 'filter[product_batch_id]' })
	@Expose({ name: 'product_batch_id' })
	@Type(() => Number)
	@IsNumber()
	productBatchId: number
}

export class ProductMovementRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[product_batch]' })
	@Expose({ name: 'product_batch' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	productBatch: boolean

	@ApiPropertyOptional({ name: 'relations[invoice]' })
	@Expose({ name: 'invoice' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	invoice: boolean

	@ApiPropertyOptional({ name: 'relations[receipt]' })
	@Expose({ name: 'receipt' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	receipt: boolean
}

export class ProductMovementSortQuery extends SortQuery {
}
