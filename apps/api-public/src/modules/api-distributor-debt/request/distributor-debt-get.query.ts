import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery, SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { IsNumber, ValidateNested } from 'class-validator'

class DistributorDebtFilterQuery {
	@ApiPropertyOptional({ name: 'filter[distributor_id]', example: 12 })
	@Expose({ name: 'distributor_id' })
	@Type(() => Number)
	@IsNumber()
	distributorId: number
}

export class DistributorDebtSortQuery extends SortQuery {
}

// export class DistributorDebtSortQuery {
// 	@Expose({ name: 'column' })
// 	@IsDefined()
// 	@IsIn(Object.keys(DistributorDebtColumnSort))
// 	column: keyof typeof DistributorDebtColumnSort

// 	@Expose({ name: 'value' })
// 	@IsDefined()
// 	@IsIn(['ASC', 'DESC'])
// 	value: 'ASC' | 'DESC'
// }

export class DistributorDebtPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: DistributorDebtFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => DistributorDebtFilterQuery)
	@ValidateNested({ each: true })
	filter: DistributorDebtFilterQuery

	@ApiPropertyOptional({ type: DistributorDebtSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => DistributorDebtSortQuery)
	@ValidateNested({ each: true })
	sort: DistributorDebtSortQuery
}
