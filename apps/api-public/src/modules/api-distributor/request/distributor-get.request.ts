import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/pagination.query'
import { DistributorFilterQuery, DistributorSortQuery } from './distributor-options.request'

export class DistributorPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: DistributorFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => DistributorFilterQuery)
	@ValidateNested({ each: true })
	filter: DistributorFilterQuery

	@ApiPropertyOptional({ type: DistributorSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => DistributorSortQuery)
	@ValidateNested({ each: true })
	sort: DistributorSortQuery
}

export class DistributorGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number

	@ApiPropertyOptional({ type: DistributorFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => DistributorFilterQuery)
	@ValidateNested({ each: true })
	filter: DistributorFilterQuery
}
