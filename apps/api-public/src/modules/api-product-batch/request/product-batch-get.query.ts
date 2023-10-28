import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { ProductBatchFilterQuery, ProductBatchRelationQuery, ProductBatchSortQuery } from './product-batch-options.request'

export class ProductBatchPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProductBatchFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductBatchFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductBatchFilterQuery

	@ApiPropertyOptional({ type: ProductBatchRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductBatchRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductBatchRelationQuery

	@ApiPropertyOptional({ type: ProductBatchSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProductBatchSortQuery)
	@ValidateNested({ each: true })
	sort: ProductBatchSortQuery
}

export class ProductBatchGetOneQuery {
	@ApiPropertyOptional({ type: ProductBatchRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductBatchRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductBatchRelationQuery
}

export class ProductBatchGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Type(() => Number)
	@IsInt()
	limit: number

	@ApiPropertyOptional({ type: ProductBatchFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductBatchFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductBatchFilterQuery

	@ApiPropertyOptional({ type: ProductBatchRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => ProductBatchRelationQuery)
	@ValidateNested({ each: true })
	relation: ProductBatchRelationQuery
}
