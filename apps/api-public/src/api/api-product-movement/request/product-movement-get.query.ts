import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
    ProductMovementFilterQuery,
    ProductMovementRelationQuery,
    ProductMovementSortQuery,
} from './product-movement-options.request'

export class ProductMovementPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: ProductMovementRelationQuery })
    @Expose()
    @Type(() => ProductMovementRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductMovementRelationQuery

    @ApiPropertyOptional({ type: ProductMovementFilterQuery })
    @Expose()
    @Type(() => ProductMovementFilterQuery)
    @ValidateNested({ each: true })
    filter: ProductMovementFilterQuery

    @ApiPropertyOptional({ type: ProductMovementSortQuery })
    @Expose()
    @Type(() => ProductMovementSortQuery)
    @ValidateNested({ each: true })
    sort: ProductMovementSortQuery
}
