import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber } from 'class-validator'

export class ProductBatchFilterQuery {
	@ApiPropertyOptional({ name: 'filter[product_id]' })
	@Expose({ name: 'product_id' })
	@Type(() => Number)
	@IsNumber()
	productId: number

	@ApiPropertyOptional({ name: 'filter[quantity_zero]' })
	@Expose({ name: 'quantity_zero' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	quantityZero: boolean

	@ApiPropertyOptional({ name: 'filter[is_active]' })
	@Expose({ name: 'overdue' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	overdue: boolean
}

export class ProductBatchRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[product]' })
	@Expose({ name: 'product' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	product: boolean
}

export class ProductBatchSortQuery extends SortQuery {
	@ApiPropertyOptional({ name: 'sort[expiry_date]' })
	@Expose({ name: 'expiry_date' })
	@IsIn(['ASC', 'DESC'])
	expiryDate: 'ASC' | 'DESC'
}
