import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/pagination.query'
import { CustomerFilterQuery, CustomerRelationQuery, CustomerSortQuery } from './customer-options.request'

export class CustomerPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: CustomerFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => CustomerFilterQuery)
	@ValidateNested({ each: true })
	filter: CustomerFilterQuery

	@ApiPropertyOptional({ type: CustomerSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => CustomerSortQuery)
	@ValidateNested({ each: true })
	sort: CustomerSortQuery
}

export class CustomerGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Type(() => Number)
	@IsInt()
	limit: number

	@ApiPropertyOptional({ type: CustomerFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => CustomerFilterQuery)
	@ValidateNested({ each: true })
	filter: CustomerFilterQuery

	@ApiPropertyOptional({ type: CustomerRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => CustomerRelationQuery)
	@ValidateNested({ each: true })
	relation: CustomerRelationQuery
}

export class CustomerGetOneQuery {
	@ApiPropertyOptional({ type: CustomerRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => CustomerRelationQuery)
	@ValidateNested({ each: true })
	relation: CustomerRelationQuery
}
