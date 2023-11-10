import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery, SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { IsNumber, ValidateNested } from 'class-validator'

class DistributorPaymentFilterQuery {
	@ApiPropertyOptional({ name: 'filter[distributor_id]', example: 12 })
	@Expose({ name: 'distributor_id' })
	@Type(() => Number)
	@IsNumber()
	distributorId: number
}

export class DistributorPaymentSortQuery extends SortQuery {
}

// export class DistributorPaymentSortQuery {
// 	@Expose({ name: 'column' })
// 	@IsDefined()
// 	@IsIn(Object.keys(DistributorPaymentColumnSort))
// 	column: keyof typeof DistributorPaymentColumnSort

// 	@Expose({ name: 'value' })
// 	@IsDefined()
// 	@IsIn(['ASC', 'DESC'])
// 	value: 'ASC' | 'DESC'
// }

export class DistributorPaymentPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: DistributorPaymentFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => DistributorPaymentFilterQuery)
	@ValidateNested({ each: true })
	filter: DistributorPaymentFilterQuery

	@ApiPropertyOptional({ type: DistributorPaymentSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => DistributorPaymentSortQuery)
	@ValidateNested({ each: true })
	sort: DistributorPaymentSortQuery
}
