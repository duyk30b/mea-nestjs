import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/query'
import { DistributorFilterQuery, DistributorSortQuery } from './distributor-options.request'

export class DistributorPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: DistributorFilterQuery })
    @Expose()
    @Type(() => DistributorFilterQuery)
    @ValidateNested({ each: true })
    filter: DistributorFilterQuery

    @ApiPropertyOptional({ type: DistributorSortQuery })
    @Expose()
    @Type(() => DistributorSortQuery)
    @ValidateNested({ each: true })
    sort: DistributorSortQuery
}

export class DistributorGetManyQuery {
    @ApiPropertyOptional({ example: 10 })
    @Expose()
    @Type(() => Number)
    @IsInt()
    limit: number

    @ApiPropertyOptional({ type: DistributorFilterQuery })
    @Expose()
    @Type(() => DistributorFilterQuery)
    @ValidateNested({ each: true })
    filter: DistributorFilterQuery
}
