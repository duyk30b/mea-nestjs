import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class ProductFilterQuery {
	@ApiPropertyOptional({ name: 'filter[group]' })
	@Expose({ name: 'group' })
	@IsString()
	group: string

	@ApiPropertyOptional({ name: 'filter[search_text]' })
	@Expose({ name: 'search_text' })
	@IsNotEmpty()
	@IsString()
	searchText: string

	@ApiPropertyOptional({ name: 'filter[is_active]' })
	@Expose({ name: 'is_active' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	isActive: boolean
}

export class ProductRelationQuery {
	@ApiPropertyOptional({ name: 'relation[product_batches]' })
	@Expose({ name: 'product_batches' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	productBatches: boolean
}

export class ProductSortQuery extends SortQuery {
	@ApiPropertyOptional({ name: 'sort[brand_name]', enum: ['ASC', 'DESC'] })
	@Expose({ name: 'brand_name' })
	@IsIn(['ASC', 'DESC'])
	brandName: 'ASC' | 'DESC'

	@ApiPropertyOptional({ name: 'sort[quantity]', enum: ['ASC', 'DESC'] })
	@Expose({ name: 'quantity' })
	@IsIn(['ASC', 'DESC'])
	quantity: 'ASC' | 'DESC'
}
