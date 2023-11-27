import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/query'
import { ReceiptFilterQuery, ReceiptRelationQuery, ReceiptSortQuery } from './receipt-options.request'

export class ReceiptPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: ReceiptFilterQuery })
    @Expose()
    @Type(() => ReceiptFilterQuery)
    @ValidateNested({ each: true })
    filter: ReceiptFilterQuery

    @ApiPropertyOptional({ type: ReceiptRelationQuery })
    @Expose()
    @Type(() => ReceiptRelationQuery)
    @ValidateNested({ each: true })
    relation: ReceiptRelationQuery

    @ApiPropertyOptional({ type: ReceiptSortQuery })
    @Expose()
    @Type(() => ReceiptSortQuery)
    @ValidateNested({ each: true })
    sort: ReceiptSortQuery
}

export class ReceiptGetManyQuery {
    @ApiPropertyOptional({ example: 10 })
    @Expose()
    @Type(() => Number)
    @IsInt()
    limit: number

    @ApiPropertyOptional({ type: ReceiptFilterQuery })
    @Expose()
    @Type(() => ReceiptFilterQuery)
    @ValidateNested({ each: true })
    filter: ReceiptFilterQuery

    @ApiPropertyOptional({ type: ReceiptRelationQuery })
    @Expose()
    @Type(() => ReceiptRelationQuery)
    @ValidateNested({ each: true })
    relation: ReceiptRelationQuery
}

export class ReceiptGetOneQuery {
    @ApiPropertyOptional({ type: ReceiptRelationQuery })
    @Expose()
    @Type(() => ReceiptRelationQuery)
    @ValidateNested({ each: true })
    relation: ReceiptRelationQuery
}
