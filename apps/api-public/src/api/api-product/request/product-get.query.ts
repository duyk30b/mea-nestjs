import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../_libs/common/dto/query'
import { ProductFilterQuery, ProductRelationQuery, ProductSortQuery } from './product-options.request'

export class ProductPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: ProductFilterQuery })
    @Expose()
    @Type(() => ProductFilterQuery)
    @ValidateNested({ each: true })
    filter: ProductFilterQuery

    @ApiPropertyOptional({ type: ProductRelationQuery })
    @Expose()
    @Type(() => ProductRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductRelationQuery

    @ApiPropertyOptional({ type: ProductSortQuery })
    @Expose()
    @Type(() => ProductSortQuery)
    @ValidateNested({ each: true })
    sort: ProductSortQuery
}

export class ProductGetManyQuery {
    @ApiPropertyOptional({ example: 10 })
    @Expose()
    @Type(() => Number)
    @IsInt()
    limit: number

    @ApiPropertyOptional({ type: ProductFilterQuery })
    @Expose()
    @Type(() => ProductFilterQuery)
    @ValidateNested({ each: true })
    filter: ProductFilterQuery

    @ApiPropertyOptional({ type: ProductRelationQuery })
    @Expose()
    @Type(() => ProductRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductRelationQuery
}

export class ProductGetOneQuery {
    @ApiPropertyOptional({ type: ProductRelationQuery })
    @Expose()
    @Type(() => ProductRelationQuery)
    @ValidateNested({ each: true })
    relation: ProductRelationQuery
}
