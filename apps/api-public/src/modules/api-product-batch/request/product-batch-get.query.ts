import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { ProductBatchFilterQuery, ProductBatchRelationsQuery, ProductBatchSortQuery } from './product-batch-options.request'

export class ProductBatchPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProductBatchFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductBatchFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductBatchFilterQuery

	@ApiPropertyOptional({ type: ProductBatchRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductBatchRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductBatchRelationsQuery

	@ApiPropertyOptional({ type: ProductBatchSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProductBatchSortQuery)
	@ValidateNested({ each: true })
	sort: ProductBatchSortQuery
}

export class ProductBatchGetOneQuery {
	@ApiPropertyOptional({ type: ProductBatchRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductBatchRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductBatchRelationsQuery
}
