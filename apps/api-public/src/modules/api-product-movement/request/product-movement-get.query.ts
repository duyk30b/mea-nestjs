import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ProductMovementFilterQuery, ProductMovementRelationsQuery, ProductMovementSortQuery } from './product-movement-options.request'

export class ProductMovementPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProductMovementRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ProductMovementRelationsQuery)
	@ValidateNested({ each: true })
	relations: ProductMovementRelationsQuery

	@ApiPropertyOptional({ type: ProductMovementFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProductMovementFilterQuery)
	@ValidateNested({ each: true })
	filter: ProductMovementFilterQuery

	@ApiPropertyOptional({ type: ProductMovementSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProductMovementSortQuery)
	@ValidateNested({ each: true })
	sort: ProductMovementSortQuery
}
