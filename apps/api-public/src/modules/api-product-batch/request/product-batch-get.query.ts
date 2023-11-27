import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/query'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import {
    ProductBatchFilterQuery,
    ProductBatchRelationQuery,
    ProductBatchSortQuery,
} from './product-batch-options.request'

export class ProductBatchPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: ProductBatchFilterQuery })
    @Expose()
    @Type(() => ProductBatchFilterQuery)
    @ValidateNested({ each: true })
    filter: ProductBatchFilterQuery

    @ApiPropertyOptional({ type: ProductBatchRelationQuery })
    @Expose()
    @Type(() => ProductBatchRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductBatchRelationQuery

    @ApiPropertyOptional({ type: ProductBatchSortQuery })
    @Expose()
    @Type(() => ProductBatchSortQuery)
    @ValidateNested({ each: true })
    sort: ProductBatchSortQuery
}

export class ProductBatchGetOneQuery {
    @ApiPropertyOptional({ type: ProductBatchRelationQuery })
    @Expose()
    @Type(() => ProductBatchRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductBatchRelationQuery
}

export class ProductBatchGetManyQuery {
    @ApiPropertyOptional({ example: 10 })
    @Expose()
    @Type(() => Number)
    @IsInt()
    limit: number

    @ApiPropertyOptional({ type: ProductBatchFilterQuery })
    @Expose()
    @Type(() => ProductBatchFilterQuery)
    @ValidateNested({ each: true })
    filter: ProductBatchFilterQuery

    @ApiPropertyOptional({ type: ProductBatchRelationQuery })
    @Expose()
    @Type(() => ProductBatchRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductBatchRelationQuery
}
