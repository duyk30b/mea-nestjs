import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { ProductFilterQuery, ProductRelationsQuery, ProductSortQuery } from './product-options.request'

export class ProductPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProductFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductFilterQuery

	@ApiPropertyOptional({ type: ProductRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductRelationsQuery

	@ApiPropertyOptional({ type: ProductSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProductSortQuery)
	@ValidateNested({ each: true })
	sort: ProductSortQuery
}

export class ProductGetManyQuery {
	@ApiProperty({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number

	@ApiPropertyOptional({ type: ProductFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductFilterQuery

	@ApiPropertyOptional({ type: ProductRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductRelationsQuery
}

export class ProductGetOneQuery {
	@ApiPropertyOptional({ type: ProductRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductRelationsQuery
}
