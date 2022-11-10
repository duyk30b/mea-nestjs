import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/pagination.query'
import { CustomerFilterQuery, CustomerRelationsQuery, CustomerSortQuery } from './customer-options.request'

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
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number

	@ApiPropertyOptional({ type: CustomerFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => CustomerFilterQuery)
	@ValidateNested({ each: true })
	filter: CustomerFilterQuery

	@ApiPropertyOptional({ type: CustomerRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => CustomerRelationsQuery)
	@ValidateNested({ each: true })
	relations: CustomerRelationsQuery
}

export class CustomerGetOneQuery {
	@ApiPropertyOptional({ type: CustomerRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => CustomerRelationsQuery)
	@ValidateNested({ each: true })
	relations: CustomerRelationsQuery
}
