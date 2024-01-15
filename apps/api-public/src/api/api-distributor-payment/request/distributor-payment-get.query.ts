import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsNumber, ValidateNested } from 'class-validator'
import { PaginationQuery, SortQuery } from '../../../../../_libs/common/dto/query'

class DistributorPaymentFilterQuery {
    @ApiPropertyOptional({ name: 'filter[distributorId]', example: 12 })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    distributorId: number
}

export class DistributorPaymentSortQuery extends SortQuery {}

// export class DistributorPaymentSortQuery {
//     @Expose({ name: 'column' })
//     @IsDefined()
//     @IsIn(Object.keys(DistributorPaymentColumnSort))
//     column: keyof typeof DistributorPaymentColumnSort

//     @Expose({ name: 'value' })
//     @IsDefined()
//     @IsIn(['ASC', 'DESC'])
//     value: 'ASC' | 'DESC'
// }

export class DistributorPaymentPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: DistributorPaymentFilterQuery })
    @Expose()
    @Type(() => DistributorPaymentFilterQuery)
    @ValidateNested({ each: true })
    filter: DistributorPaymentFilterQuery

    @ApiPropertyOptional({ type: DistributorPaymentSortQuery })
    @Expose()
    @Type(() => DistributorPaymentSortQuery)
    @ValidateNested({ each: true })
    sort: DistributorPaymentSortQuery
}
