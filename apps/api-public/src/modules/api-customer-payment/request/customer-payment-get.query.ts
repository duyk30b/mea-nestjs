import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery, SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Type } from 'class-transformer'
import { IsNumber, ValidateNested } from 'class-validator'

class CustomerPaymentFilterQuery {
    @ApiPropertyOptional({ name: 'filter[customer_id]', example: 12 })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    customerId: number
}

export class CustomerPaymentSortQuery extends SortQuery {}

export class CustomerPaymentPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: CustomerPaymentFilterQuery })
    @Expose()
    @Type(() => CustomerPaymentFilterQuery)
    @ValidateNested({ each: true })
    filter: CustomerPaymentFilterQuery

    @ApiPropertyOptional({ type: CustomerPaymentSortQuery })
    @Expose()
    @Type(() => CustomerPaymentSortQuery)
    @ValidateNested({ each: true })
    sort: CustomerPaymentSortQuery
}
