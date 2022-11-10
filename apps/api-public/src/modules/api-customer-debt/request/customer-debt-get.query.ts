import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery, SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { IsNumber, ValidateNested } from 'class-validator'

class CustomerDebtFilterQuery {
	@ApiPropertyOptional({ name: 'filter[customer_id]', example: 12 })
	@Expose({ name: 'customer_id' })
	@Type(() => Number)
	@IsNumber()
	customerId: number
}

export class CustomerDebtSortQuery extends SortQuery {
}

export class CustomerDebtPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: CustomerDebtFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => CustomerDebtFilterQuery)
	@ValidateNested({ each: true })
	filter: CustomerDebtFilterQuery

	@ApiPropertyOptional({ type: CustomerDebtSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => CustomerDebtSortQuery)
	@ValidateNested({ each: true })
	sort: CustomerDebtSortQuery
}
