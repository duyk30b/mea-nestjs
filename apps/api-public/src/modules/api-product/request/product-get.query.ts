import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { ProductFilterQuery, ProductRelationQuery, ProductSortQuery } from './product-options.request'

export class ProductPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProductFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductFilterQuery

	@ApiPropertyOptional({ type: ProductRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductRelationQuery

	@ApiPropertyOptional({ type: ProductSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProductSortQuery)
	@ValidateNested({ each: true })
	sort: ProductSortQuery
}

export class ProductGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Type(() => Number)
	@IsInt()
	limit: number

	@ApiPropertyOptional({ type: ProductFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductFilterQuery

	@ApiPropertyOptional({ type: ProductRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductRelationQuery
}

export class ProductGetOneQuery {
	@ApiPropertyOptional({ type: ProductRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductRelationQuery
}
